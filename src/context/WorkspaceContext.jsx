import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { formatBytes } from '../utils/format';
import { detectFormat } from '../utils/fileValidation';
import { readMetadata } from '../utils/metadataReader';
import { stripMetadata } from '../utils/metadataStripper';

const WorkspaceContext = createContext(null);

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB aggregate

/**
 * Read a File into an ArrayBuffer while reporting real byte progress.
 */
function readFileBuffer(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(event.loaded, event.total);
      }
    };
    reader.onload = () => {
      if (typeof onProgress === 'function') onProgress(file.size, file.size);
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read the file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function WorkspaceProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Keep the latest files in a ref for async callbacks + unmount cleanup.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Parsed ArrayBuffers keyed by file id (read once, reused for cleaning).
  const bufferStore = useRef(new Map());

  const totalBytes = useMemo(
    () => files.reduce((acc, curr) => acc + (curr.size || 0), 0),
    [files],
  );

  const activeFile = useMemo(() => {
    if (!files.length) return null;
    return files.find((f) => f.id === activeFileId) || files[0];
  }, [files, activeFileId]);

  const cleanupFileUrls = useCallback((entry) => {
    if (!entry) return;
    if (entry.previewUrl) {
      try { URL.revokeObjectURL(entry.previewUrl); } catch { /* ignore */ }
    }
    if (entry.cleanedUrl) {
      try { URL.revokeObjectURL(entry.cleanedUrl); } catch { /* ignore */ }
    }
  }, []);

  // Revoke every object URL only on unmount (not on every state change).
  useEffect(() => {
    const store = bufferStore.current;
    return () => {
      filesRef.current.forEach(cleanupFileUrls);
      store.clear();
    };
  }, [cleanupFileUrls]);

  const updateFile = useCallback((id, updates) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  }, []);

  // ---- Scan pipeline: read → validate → parse metadata -------------------
  const scanEntry = useCallback(
    async (entry, buffer) => {
      const { id, originalFile } = entry;
      try {
        updateFile(id, {
          status: 'uploading',
          progress: buffer ? 50 : 0,
          stageLabel: buffer ? 'Validating…' : 'Reading…',
          error: null,
        });

        let data = buffer;
        if (!data) {
          data = await readFileBuffer(originalFile, (loaded, total) => {
            const pct = total ? Math.min(40, Math.round((loaded / total) * 40)) : 0;
            updateFile(id, {
              progress: pct,
              stageLabel: `${formatBytes(loaded)} of ${formatBytes(total)}`,
            });
          });
          bufferStore.current.set(id, data);
        }

        updateFile(id, { progress: 50, stageLabel: 'Validating…' });
        const format = detectFormat(data);

        updateFile(id, { progress: 65, stageLabel: 'Scanning metadata…' });
        const meta = await readMetadata(data, originalFile, format);

        updateFile(id, {
          status: 'uploaded',
          progress: 100,
          stageLabel: 'File uploaded',
          format,
          metadata: meta,
          aiRisk: meta.aiRisk,
          presentFlags: meta.presentFlags,
          notPresent: meta.notPresent,
          detectedAiSignals: meta.aiSignals,
          totalTagCount: meta.removableTagCount ?? meta.totalTagCount ?? 0,
          dimensions: meta.dimensions,
        });
      } catch (err) {
        updateFile(id, {
          status: 'error',
          progress: 100,
          stageLabel: 'Failed',
          error: err?.message || 'Could not read this image.',
        });
      }
    },
    [updateFile],
  );

  // ---- Clean pipeline: validate → strip → build clean blob ---------------
  const cleanEntry = useCallback(
    async (entry) => {
      const { id, originalFile } = entry;
      const current = filesRef.current.find((f) => f.id === id) || entry;

      try {
        if (current.cleanedUrl) {
          try { URL.revokeObjectURL(current.cleanedUrl); } catch { /* ignore */ }
        }

        updateFile(id, {
          status: 'processing',
          progress: 0,
          stageLabel: 'Preparing…',
          error: null,
          cleanedBlob: null,
          cleanedUrl: null,
        });

        let data = bufferStore.current.get(id);
        if (!data) {
          data = await readFileBuffer(originalFile, (loaded, total) => {
            const pct = total ? Math.min(20, Math.round((loaded / total) * 20)) : 0;
            updateFile(id, {
              progress: pct,
              stageLabel: `${formatBytes(loaded)} of ${formatBytes(total)}`,
            });
          });
          bufferStore.current.set(id, data);
        }

        const format = current.format || detectFormat(data);

        updateFile(id, { progress: 20, stageLabel: 'Stripping metadata…' });
        const result = await stripMetadata(data, format, (pct) => {
          const mapped = 20 + Math.round(pct * 0.8);
          updateFile(id, {
            progress: Math.min(99, mapped),
            stageLabel: pct < 100 ? 'Stripping metadata…' : 'Finalising…',
          });
        });

        const cleanedUrl = URL.createObjectURL(result.blob);
        updateFile(id, {
          status: 'cleaned',
          progress: 100,
          stageLabel: result.lossless ? 'Cleaned · lossless' : 'Cleaned · re-encoded',
          cleanedBlob: result.blob,
          cleanedUrl,
          cleanedSize: result.blob.size,
          removedTagCount: current.metadata?.removableTagCount ?? current.totalTagCount ?? 0,
          lossless: result.lossless,
          outputExtension: result.outputExtension,
        });

        return true;
      } catch (err) {
        updateFile(id, {
          status: 'error',
          progress: 100,
          stageLabel: 'Failed',
          error: err?.message || 'Could not clean this image.',
        });
        return false;
      }
    },
    [updateFile],
  );

  // ---- Add files ---------------------------------------------------------
  const addFiles = useCallback(
    (incomingFiles) => {
      setErrorMessage(null);

      const list = Array.from(incomingFiles || []);
      if (!list.length) return false;

      if (files.length + list.length > MAX_FILES) {
        setErrorMessage(`Upload limit exceeded: You can only add up to ${MAX_FILES} images at a time.`);
        return false;
      }

      const incomingBytes = list.reduce((acc, f) => acc + f.size, 0);
      if (totalBytes + incomingBytes > MAX_TOTAL_BYTES) {
        setErrorMessage('Size limit exceeded: Total batch size must not exceed 100 MB.');
        return false;
      }

      const entries = list.map((file) => {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type || '',
          previewUrl: URL.createObjectURL(file),
          status: 'uploading',
          progress: 0,
          stageLabel: 'Queued…',
          error: null,
          format: null,
          dimensions: null,
          metadata: null,
          aiRisk: 'none',
          presentFlags: null,
          notPresent: [],
          detectedAiSignals: [],
          totalTagCount: 0,
          cleanedBlob: null,
          cleanedUrl: null,
          cleanedSize: null,
          removedTagCount: 0,
          lossless: null,
          outputExtension: null,
        };
      });

      setFiles((prev) => {
        const next = [...prev, ...entries];
        if (!activeFileId && next.length) setActiveFileId(next[0].id);
        return next;
      });

      // Kick off async scanning for each new file.
      entries.forEach((entry) => { scanEntry(entry); });

      return true;
    },
    [files.length, totalBytes, activeFileId, scanEntry],
  );

  // ---- Remove / clear ----------------------------------------------------
  const removeFile = useCallback(
    (id) => {
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id);
        if (target) cleanupFileUrls(target);
        bufferStore.current.delete(id);
        const next = prev.filter((f) => f.id !== id);
        if (activeFileId === id) {
          setActiveFileId(next.length ? next[0].id : null);
        }
        return next;
      });
    },
    [activeFileId, cleanupFileUrls],
  );

  const clearAllFiles = useCallback(() => {
    filesRef.current.forEach(cleanupFileUrls);
    bufferStore.current.clear();
    setFiles([]);
    setActiveFileId(null);
    setErrorMessage(null);
  }, [cleanupFileUrls]);

  // ---- Clean actions -----------------------------------------------------
  const cleanFile = useCallback(
    (id) => {
      const entry = filesRef.current.find((f) => f.id === id);
      if (!entry) return Promise.resolve(false);
      return cleanEntry(entry);
    },
    [cleanEntry],
  );

  const cleanAll = useCallback(async () => {
    const targets = filesRef.current.filter((f) => f.status === 'uploaded');
    if (!targets.length) return false;
    const results = await Promise.all(targets.map((entry) => cleanEntry(entry)));
    return results.some(Boolean);
  }, [cleanEntry]);

  const retryFile = useCallback(
    (id) => {
      const entry = filesRef.current.find((f) => f.id === id);
      if (!entry) return;
      if (entry.metadata) cleanEntry(entry);
      else scanEntry(entry);
    },
    [cleanEntry, scanEntry],
  );

  // ---- Demo image (unused button removed, kept for API compatibility) ----
  const loadDemoFile = useCallback(async () => {
    setErrorMessage(null);
    if (files.length >= MAX_FILES) {
      setErrorMessage(`Upload limit reached (${MAX_FILES} files maximum).`);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#2563EB');
    gradient.addColorStop(1, '#06B6D4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DEMO IMAGE', 512, 512);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const demoFile = new File([blob], 'demo-image.png', { type: 'image/png' });
    addFiles([demoFile]);
  }, [files.length, addFiles]);

  const value = {
    files,
    activeFileId,
    activeFile,
    setActiveFileId,
    totalBytes,
    maxFiles: MAX_FILES,
    maxTotalBytes: MAX_TOTAL_BYTES,
    errorMessage,
    setErrorMessage,
    addFiles,
    removeFile,
    clearAllFiles,
    updateFile,
    scanFile: (id) => {
      const entry = filesRef.current.find((f) => f.id === id);
      if (entry) scanEntry(entry);
    },
    cleanFile,
    cleanAll,
    retryFile,
    loadDemoFile,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
