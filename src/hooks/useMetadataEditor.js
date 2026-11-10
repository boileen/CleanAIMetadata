/**
 * Single-photo metadata editor state.
 *
 * Handles reading one file, prefilling editable fields, validation, writing,
 * read-back verification and the download URL lifecycle. It deliberately does
 * not use the multi-file workspace queue.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { detectFormat, formatLabel } from '../utils/fileValidation';
import { formatBytes } from '../utils/format';
import { readMetadata } from '../utils/metadataReader';
import { writeMetadata } from '../utils/metadataWriter';
import {
  hasIccProfile,
  verifyWrittenMetadata,
} from '../utils/metadataWriter/verify';
import {
  EDITABLE_FORMATS,
  METADATA_FIELDS,
  METADATA_TABS,
  getDefaultValues,
  getFieldsForTab,
  isFieldSupported,
} from '../config/metadataSchema';

const MAX_FILE_BYTES = 100 * 1024 * 1024;

const DEFAULT_EXPANDED = new Set([
  'EXIF::Camera & Lens',
  'IPTC::Caption & Keywords',
  'XMP::Description',
]);

const EMPTY_VALUES = getDefaultValues();

function normalisePrefill(editable) {
  const values = { ...EMPTY_VALUES };
  if (!editable || typeof editable !== 'object') return values;

  Object.keys(values).forEach((key) => {
    const value = editable[key];
    if (value === undefined || value === null) return;
    values[key] = String(value);
  });
  return values;
}

function outputName(name, format) {
  const base = String(name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const extension = format === 'jpeg' ? 'jpg' : format;
  return `${base}-metadata.${extension}`;
}

function matchesSearch(field, query) {
  if (!query) return true;
  const haystack = [
    field.label,
    field.id,
    field.group,
    field.help,
    field.placeholder,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function useMetadataEditor() {
  const [entry, setEntry] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [values, setValues] = useState(() => ({ ...EMPTY_VALUES }));
  const [initialValues, setInitialValues] = useState(() => ({ ...EMPTY_VALUES }));
  const [mode, setModeState] = useState('preserve');
  const [activeTab, setActiveTab] = useState('EXIF');
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(() => new Set(DEFAULT_EXPANDED));
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [verification, setVerification] = useState(null);
  const [notice, setNotice] = useState(null);

  const previewUrlRef = useRef('');
  const resultUrlRef = useRef('');
  const fileTokenRef = useRef(0);
  const processTokenRef = useRef(0);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      try { URL.revokeObjectURL(previewUrlRef.current); } catch { /* ignore */ }
      previewUrlRef.current = '';
    }
  }, []);

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) {
      try { URL.revokeObjectURL(resultUrlRef.current); } catch { /* ignore */ }
      resultUrlRef.current = '';
    }
    setResult(null);
    setVerification(null);
  }, []);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        try { URL.revokeObjectURL(previewUrlRef.current); } catch { /* ignore */ }
      }
      if (resultUrlRef.current) {
        try { URL.revokeObjectURL(resultUrlRef.current); } catch { /* ignore */ }
      }
    },
    [],
  );

  const selectFile = useCallback(
    async (file) => {
      if (!file) return;

      if (file.size > MAX_FILE_BYTES) {
        setError(
          `This file is ${formatBytes(file.size)}. The editor accepts files up to 100 MB.`,
        );
        return;
      }

      const token = fileTokenRef.current + 1;
      fileTokenRef.current = token;

      clearResult();
      setError(null);
      setNotice(null);
      setStatus('reading');
      setProgress(8);
      setProgressLabel('Reading file…');

      revokePreview();
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
          setError('This file could not be read. Try selecting it again.');
        }
        return;
      }

      if (fileTokenRef.current !== token) return;

      let format;
      try {
        format = detectFormat(buffer);
      } catch (err) {
        setStatus('error');
        setError(err?.message || 'Unsupported or corrupt image format.');
        return;
      }

      const supported = EDITABLE_FORMATS.has(format);
      setProgress(34);
      setProgressLabel(supported ? 'Reading metadata…' : 'Checking format…');

      let metadata = null;
      try {
        metadata = await readMetadata(buffer, file, format, { includeEditable: supported });
      } catch {
        metadata = null;
      }

      if (fileTokenRef.current !== token) return;

      const nextValues = normalisePrefill(metadata?.editableMetadata);
      setEntry({
        file,
        buffer,
        format,
        supported,
        metadata,
        dimensions: metadata?.dimensions || null,
        iccPresent: hasIccProfile(buffer, format),
      });
      setValues(nextValues);
      setInitialValues(nextValues);
      setExpandedGroups(new Set(DEFAULT_EXPANDED));
      setActiveTab('EXIF');
      setSearch('');
      setProgress(100);
      setProgressLabel('');
      setStatus('ready');
    },
    [clearResult, revokePreview],
  );

  const updateValue = useCallback(
    (id, value) => {
      setValues((prev) => ({ ...prev, [id]: value }));
      setNotice(null);
      clearResult();
      if (error) setError(null);
    },
    [clearResult, error],
  );

  const setMode = useCallback(
    (nextMode) => {
      if (nextMode !== 'remove' && nextMode !== 'preserve') return;
      setModeState(nextMode);
      setNotice(null);
      clearResult();
    },
    [clearResult],
  );

  const applyPreset = useCallback(
    (preset) => {
      if (!preset?.values) return;
      setValues((prev) => ({ ...prev, ...preset.values }));
      setNotice(`${preset.name} preset applied.`);
      clearResult();
    },
    [clearResult],
  );

  const resetValues = useCallback(() => {
    setValues({ ...initialValues });
    setNotice('Fields restored from the original file.');
    clearResult();
  }, [clearResult, initialValues]);

  const clearValues = useCallback(() => {
    setValues({ ...EMPTY_VALUES });
    setNotice('All editable fields cleared.');
    clearResult();
  }, [clearResult]);

  const process = useCallback(async () => {
    if (!entry || !entry.supported) return;

    const token = processTokenRef.current + 1;
    processTokenRef.current = token;

    clearResult();
    setError(null);
    setNotice(null);
    setStatus('processing');
    setProgress(2);
    setProgressLabel('Preparing…');

    try {
      const { blob } = await writeMetadata(
        entry.buffer,
        entry.format,
        mode,
        values,
        (percent, label) => {
          if (processTokenRef.current !== token) return;
          setProgress(Math.min(90, Math.max(0, percent)));
          if (label) setProgressLabel(label);
        },
      );

      if (processTokenRef.current !== token) return;

      setProgress(93);
      setProgressLabel('Verifying written metadata…');
      const report = await verifyWrittenMetadata(
        blob,
        entry.file,
        entry.format,
        values,
        entry.buffer,
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
      setVerification(report);
      setProgress(100);
      setProgressLabel('Complete');
      setStatus('done');
    } catch (err) {
      if (processTokenRef.current !== token) return;
      setStatus('error');
      setProgress(0);
      setProgressLabel('');
      setError(err?.message || 'The metadata could not be written.');
    }
  }, [clearResult, entry, mode, values]);

  const download = useCallback(() => {
    if (!result?.url) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  const resetAll = useCallback(() => {
    fileTokenRef.current += 1;
    processTokenRef.current += 1;
    clearResult();
    revokePreview();
    setPreviewUrl('');
    setEntry(null);
    setValues({ ...EMPTY_VALUES });
    setInitialValues({ ...EMPTY_VALUES });
    setActiveTab('EXIF');
    setSearch('');
    setExpandedGroups(new Set(DEFAULT_EXPANDED));
    setStatus('idle');
    setProgress(0);
    setProgressLabel('');
    setError(null);
    setNotice(null);
  }, [clearResult, revokePreview]);

  const toggleGroup = useCallback((key) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const expandAll = useCallback((keys) => {
    setExpandedGroups(new Set(keys));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  const filledByTab = useMemo(() => {
    const counts = Object.fromEntries(METADATA_TABS.map((tab) => [tab.id, 0]));
    const format = entry?.format;
    METADATA_FIELDS.forEach((field) => {
      if (!isFieldSupported(field, format)) return;
      if (String(values[field.id] ?? '').trim() !== '') {
        counts[field.tab] = (counts[field.tab] || 0) + 1;
      }
    });
    return counts;
  }, [entry?.format, values]);

  const filledCount = useMemo(() => {
    const format = entry?.format;
    return METADATA_FIELDS.reduce(
      (total, field) =>
        total +
        (isFieldSupported(field, format) &&
        String(values[field.id] ?? '').trim() !== ''
          ? 1
          : 0),
      0,
    );
  }, [entry?.format, values]);

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fields = getFieldsForTab(activeTab).filter((field) =>
      matchesSearch(field, query),
    );

    const map = new Map();
    fields.forEach((field) => {
      const key = `${activeTab}::${field.group || 'Fields'}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: field.group || 'Fields',
          fields: [],
        });
      }
      map.get(key).fields.push(field);
    });

    return Array.from(map.values()).map((group) => ({
      ...group,
      filled: group.fields.filter(
        (field) =>
          isFieldSupported(field, entry?.format) &&
          String(values[field.id] ?? '').trim() !== '',
      ).length,
      expanded: Boolean(query) || expandedGroups.has(group.key),
    }));
  }, [activeTab, entry?.format, expandedGroups, search, values]);

  const groupKeys = useMemo(
    () => groups.map((group) => group.key),
    [groups],
  );

  return {
    // file state
    entry,
    previewUrl,
    fileInfo: entry
      ? {
          name: entry.file.name,
          size: formatBytes(entry.file.size),
          sizeBytes: entry.file.size,
          format: entry.format,
          formatLabel: formatLabel(entry.format),
          dimensions: entry.dimensions,
          iccPresent: entry.iccPresent,
          supported: entry.supported,
        }
      : null,
    isSupported: Boolean(entry?.supported),

    // editor state
    values,
    initialValues,
    mode,
    setMode,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    groups,
    groupKeys,
    expandedGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    filledByTab,
    filledCount,
    notice,
    setNotice,

    // actions
    selectFile,
    updateValue,
    applyPreset,
    resetValues,
    clearValues,
    process,
    download,
    resetAll,

    // processing state
    status,
    progress,
    progressLabel,
    error,
    result,
    verification,
  };
}
