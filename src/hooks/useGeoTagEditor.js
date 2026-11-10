/**
 * Geotag editor state hook.
 *
 * Handles reading one file, writing GPS + optional caption/keyword metadata
 * back into it, and producing a download URL. The "Remove Location" path
 * strips every GPS tag while keeping all other metadata intact.
 *
 * Uses the same writeMetadata() / metadataStripper pipeline as the Edit page
 * so the GPS IFD is written correctly and verified before download.
 */

import { useCallback, useRef, useState } from 'react';
import { detectFormat } from '../utils/fileValidation';
import { readMetadata } from '../utils/metadataReader';
import { writeMetadata } from '../utils/metadataWriter';
import { stripMetadata } from '../utils/metadataStripper';

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const EDITABLE_FORMATS = new Set(['jpeg', 'png', 'webp']);

/** Keys that belong to the GPS IFD — excluded when carrying fields forward. */
const GPS_KEYS = new Set([
  'gpsLatitude', 'gpsLongitude', 'gpsAltitude', 'gpsAltitudeRef',
  'gpsDirection', 'gpsDirectionRef', 'gpsSpeed', 'gpsSpeedUnit',
  'gpsDate', 'gpsTime',
]);

function hasVal(v) {
  return v !== null && v !== undefined && String(v).trim() !== '';
}

/** Copy an editable-metadata object without any GPS keys. */
function withoutGps(editable) {
  if (!editable) return {};
  const out = {};
  Object.keys(editable).forEach((key) => {
    if (!GPS_KEYS.has(key)) out[key] = editable[key];
  });
  return out;
}

function outputName(name, format) {
  const base = String(name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `geotagged_${base}.${ext}`;
}

function strippedName(name, format) {
  const base = String(name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `no-gps_${base}.${ext}`;
}

export default function useGeoTagEditor() {
  const [entry, setEntry] = useState(null);       // { file, buffer, format, supported, metadata }
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('idle');   // idle | reading | ready | processing | done | error
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);     // { blob, url, name, size }

  const previewUrlRef = useRef('');
  const resultUrlRef = useRef('');
  const fileTokenRef = useRef(0);
  const processTokenRef = useRef(0);

  const revokeAll = useCallback(() => {
    if (previewUrlRef.current) {
      try { URL.revokeObjectURL(previewUrlRef.current); } catch { /* ignore */ }
      previewUrlRef.current = '';
    }
    if (resultUrlRef.current) {
      try { URL.revokeObjectURL(resultUrlRef.current); } catch { /* ignore */ }
      resultUrlRef.current = '';
    }
  }, []);

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) {
      try { URL.revokeObjectURL(resultUrlRef.current); } catch { /* ignore */ }
      resultUrlRef.current = '';
    }
    setResult(null);
  }, []);

  // ── Load a file ──────────────────────────────────────────────────────────
  const selectFile = useCallback(async (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 100 MB.`);
      return;
    }

    const token = ++fileTokenRef.current;
    clearResult();
    setError(null);
    setStatus('reading');
    setProgress(10);
    setProgressLabel('Reading file…');

    // Revoke old preview
    if (previewUrlRef.current) {
      try { URL.revokeObjectURL(previewUrlRef.current); } catch { /* ignore */ }
    }
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setPreviewUrl(preview);
    setEntry(null);

    let buffer;
    try {
      buffer = await file.arrayBuffer();
    } catch {
      if (fileTokenRef.current === token) {
        setStatus('error');
        setError('Could not read the file. Try selecting it again.');
      }
      return;
    }
    if (fileTokenRef.current !== token) return;

    let format;
    try {
      format = detectFormat(buffer);
    } catch {
      setStatus('error');
      setError('Unsupported or corrupt image format.');
      return;
    }

    setProgress(50);
    setProgressLabel('Reading metadata…');

    let metadata = null;
    try {
      metadata = await readMetadata(buffer, file, format, { includeEditable: true });
    } catch {
      metadata = null;
    }

    if (fileTokenRef.current !== token) return;

    setEntry({ file, buffer, format, supported: EDITABLE_FORMATS.has(format), metadata });
    setStatus('ready');
    setProgress(100);
    setProgressLabel('');
  }, [clearResult]);

  // ── Save GPS location ────────────────────────────────────────────────────
  const saveLocation = useCallback(async (coords) => {
    if (!entry) return;

    if (!entry.supported) {
      setError(`${String(entry.format).toUpperCase()} files cannot be edited in-browser. Please convert to JPEG, PNG or WebP first.`);
      return;
    }

    // Require at least lat + lng
    const lat = parseFloat(coords.latitude);
    const lng = parseFloat(coords.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Please enter a valid Latitude and Longitude before saving.');
      return;
    }

    const token = ++processTokenRef.current;
    clearResult();
    setError(null);
    setStatus('processing');
    setProgress(5);
    setProgressLabel('Preparing…');

    try {
      const mode = coords.removeOtherMetadata ? 'remove' : 'preserve';

      // Build the values object the writer understands. In preserve mode the
      // writer replaces the whole EXIF/IPTC/XMP carrier, so we must carry every
      // existing non-GPS field forward or the camera make/model/copyright would
      // be silently dropped.
      const carried =
        mode === 'preserve' ? withoutGps(entry.metadata?.editableMetadata) : {};

      const values = {
        ...carried,
        // Core GPS
        gpsLatitude: lat,
        gpsLongitude: lng,
        gpsAltitude: hasVal(coords.altitude) ? coords.altitude : undefined,
        gpsAltitudeRef: coords.altitudeRef || 'above',
        gpsDirection: hasVal(coords.direction) ? coords.direction : undefined,
        gpsDirectionRef: coords.directionRef || 'true',
        gpsSpeed: hasVal(coords.speed) ? coords.speed : undefined,
        gpsSpeedUnit: coords.speedUnit || 'K',
        gpsDate: coords.gpsDate || undefined,
        gpsTime: coords.gpsTime || undefined,
        // Caption / keywords (written to IPTC + XMP)
        ...(coords.description
          ? { caption: coords.description, imageDescription: coords.description }
          : {}),
        ...(coords.keywords ? { keywords: coords.keywords } : {}),
      };

      const { blob } = await writeMetadata(
        entry.buffer,
        entry.format,
        mode,
        values,
        (pct, label) => {
          if (processTokenRef.current !== token) return;
          setProgress(Math.min(90, Math.max(0, pct)));
          if (label) setProgressLabel(label);
        },
      );

      if (processTokenRef.current !== token) return;

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({
        blob,
        url,
        name: outputName(entry.file.name, entry.format),
        size: blob.size,
      });
      setProgress(100);
      setProgressLabel('Done');
      setStatus('done');
    } catch (err) {
      if (processTokenRef.current !== token) return;
      setStatus('error');
      setProgress(0);
      setProgressLabel('');
      setError(err?.message || 'Could not write GPS metadata.');
    }
  }, [clearResult, entry]);

  // ── Remove GPS only ──────────────────────────────────────────────────────
  const removeLocation = useCallback(async () => {
    if (!entry) return;

    if (!entry.supported) {
      setError(`${String(entry.format).toUpperCase()} files cannot be edited in-browser.`);
      return;
    }

    const token = ++processTokenRef.current;
    clearResult();
    setError(null);
    setStatus('processing');
    setProgress(5);
    setProgressLabel('Stripping GPS tags…');

    try {
      // Strip all metadata first, then re-inject every non-GPS field from the
      // original so camera EXIF / IPTC / copyright are preserved.
      const { blob: stripped } = await stripMetadata(entry.buffer, entry.format, (pct) => {
        if (processTokenRef.current !== token) return;
        setProgress(5 + Math.round(pct * 0.5));
      });

      if (processTokenRef.current !== token) return;

      setProgress(60);
      setProgressLabel('Restoring non-GPS metadata…');

      // Re-read editable fields from the ORIGINAL file, minus every GPS key
      let originalValues = {};
      try {
        const meta = await readMetadata(entry.buffer, entry.file, entry.format, { includeEditable: true });
        originalValues = withoutGps(meta?.editableMetadata);
      } catch { /* ignore */ }


      const strippedBuffer = await stripped.arrayBuffer();
      const { blob: final } = await writeMetadata(
        strippedBuffer,
        entry.format,
        'preserve',
        originalValues,
        (pct, label) => {
          if (processTokenRef.current !== token) return;
          setProgress(60 + Math.round(pct * 0.35));
          if (label) setProgressLabel(label);
        },
      );

      if (processTokenRef.current !== token) return;

      const url = URL.createObjectURL(final);
      resultUrlRef.current = url;
      setResult({
        blob: final,
        url,
        name: strippedName(entry.file.name, entry.format),
        size: final.size,
      });
      setProgress(100);
      setProgressLabel('Done');
      setStatus('done');
    } catch (err) {
      if (processTokenRef.current !== token) return;
      setStatus('error');
      setProgress(0);
      setProgressLabel('');
      setError(err?.message || 'Could not remove GPS metadata.');
    }
  }, [clearResult, entry]);

  // ── Download result ──────────────────────────────────────────────────────
  const download = useCallback(() => {
    if (!result?.url) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  // ── Reset everything ─────────────────────────────────────────────────────
  const reset = useCallback(() => {
    fileTokenRef.current += 1;
    processTokenRef.current += 1;
    revokeAll();
    setPreviewUrl('');
    setEntry(null);
    setStatus('idle');
    setProgress(0);
    setProgressLabel('');
    setError(null);
    setResult(null);
  }, [revokeAll]);

  return {
    // file state
    entry,
    previewUrl,
    format: entry?.format || null,
    isSupported: Boolean(entry?.supported),
    isUnsupported: Boolean(entry && !entry.supported),
    metadata: entry?.metadata || null,
    hasGpsData: Boolean(entry?.metadata?.gps?.latitude != null),
    existingGps: entry?.metadata?.gps || null,

    // processing
    status,
    progress,
    progressLabel,
    error,
    result,

    // actions
    selectFile,
    saveLocation,
    removeLocation,
    download,
    reset,
  };
}
