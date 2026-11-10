import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Layers,
  Info,
  X,
  Copy,
  Check,
  Download,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

function buildReport(file, sections, metadata) {
  const sectionMap = {};
  sections.forEach((section) => {
    sectionMap[section.title] = {};
    section.fields.forEach((field) => {
      sectionMap[section.title][field.key] = field.value;
    });
  });

  return {
    file: file?.name || null,
    size: file?.size ?? null,
    mimeType: file?.type || null,
    format: file?.format || null,
    totalFields: metadata?.totalFields ?? null,
    aiRisk: metadata?.aiRisk || 'none',
    aiSignals: metadata?.aiSignals || [],
    present: metadata?.presentFlags || {},
    notPresent: metadata?.notPresent || [],
    sections: sectionMap,
  };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Inline metadata inspection panel (matches the DeleteFootprints upload view).
 * Expects a workspace file entry whose `metadata` was produced by
 * `readMetadata()` (sections + AI footprint data).
 *
 * Optional props keep the Remove page behaviour unchanged:
 *  - `onClose`     render a close button and call it when clicked
 *  - `showExport`  render Copy JSON / CSV buttons
 *  - `onRetry`     render a retry button in the failed state
 */
export default function MetadataPreview({
  file,
  onClose = null,
  showExport = false,
  showFileName = true,
  onRetry = null,
  defaultOpenAll = false,
}) {
  const metadata = file?.metadata;

  const sections = useMemo(() => {
    if (!metadata) return [];
    if (Array.isArray(metadata.sections)) return metadata.sections;
    // Fallback for older/simple shapes.
    if (Array.isArray(metadata.flatFields)) {
      return [
        {
          id: 'other',
          title: 'Other metadata',
          shortTitle: 'Other',
          description: 'Other hidden details',
          fields: metadata.flatFields,
        },
      ];
    }
    return [];
  }, [metadata]);

  const sectionSignature = sections.map((section) => section.id).join('|');

  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    sections.forEach((section, index) => {
      initial[section.id] = defaultOpenAll ? true : index === 0;
    });
    return initial;
  });

  const [copiedJson, setCopiedJson] = useState(false);

  // Re-open the first section whenever a different file is inspected.
  useEffect(() => {
    const initial = {};
    sections.forEach((section, index) => {
      initial[section.id] = defaultOpenAll ? true : index === 0;
    });
    setOpenSections(initial);
  }, [file?.id, sectionSignature, defaultOpenAll]);

  if (!file) return null;

  if (file.status === 'error') {
    return (
      <div className="bg-white rounded-panel border border-subtle shadow-subtle p-6 sm:p-7 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-risk-rose-bg border border-risk-rose-border flex items-center justify-center text-risk-rose-text shrink-0">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Could not read metadata</p>
              <p className="text-xs text-risk-rose-text mt-0.5">
                {file.error || 'This file could not be parsed in the browser.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-card-strong border border-subtle text-xs font-semibold text-muted-strong hover:text-foreground transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card-strong transition-colors"
                title="Close metadata"
                aria-label="Close metadata"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    const scanning = file.status === 'uploading' || file.status === 'processing';
    return (
      <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle animate-fadeIn">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-muted">
            {scanning ? (
              <Loader2 className="w-4 h-4 text-brand animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-brand" />
            )}
            <span>{scanning ? 'Reading metadata…' : 'No metadata available.'}</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card-strong transition-colors"
              title="Close metadata"
              aria-label="Close metadata"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalFields = metadata.totalFields ?? sections.reduce((sum, s) => sum + s.fields.length, 0);
  const aiRisk = metadata.aiRisk || 'none';
  const aiSignals = metadata.aiSignals || [];
  const notPresent = metadata.notPresent || [];
  const presentFlags = metadata.presentFlags || {};

  const presentLabels = [
    ['C2PA', 'c2pa'],
    ['XMP', 'xmp'],
    ['IPTC', 'iptc'],
    ['EXIF', 'exif'],
    ['Location', 'location'],
    ['AI prompt & settings', 'aiPrompt'],
  ]
    .filter(([, key]) => presentFlags[key])
    .map(([label]) => label);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllSections = (open) => {
    const next = {};
    sections.forEach((section) => { next[section.id] = open; });
    setOpenSections(next);
  };

  const handleCopyJson = async () => {
    const text = JSON.stringify(buildReport(file, sections, metadata), null, 2);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      setCopiedJson(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [['Section', 'Key', 'Value']];
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        rows.push([section.title, field.key, field.value]);
      });
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${baseName}-metadata.csv`);
  };

  const riskStyles =
    aiRisk === 'high'
      ? { wrap: 'bg-risk-rose-bg border-risk-rose-border', text: 'text-risk-rose-text', icon: ShieldAlert }
      : aiRisk === 'medium'
        ? { wrap: 'bg-risk-amber-bg border-risk-amber-border', text: 'text-risk-amber-text', icon: ShieldAlert }
        : { wrap: 'bg-risk-emerald-bg border-risk-emerald-border', text: 'text-risk-emerald-text', icon: ShieldCheck };

  const RiskIcon = riskStyles.icon;

  return (
    <div className="bg-white rounded-panel border border-subtle shadow-subtle overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-7 space-y-4 border-b border-subtle/60">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold text-muted">
              Total fields
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground leading-none">{totalFields}</span>
              <span className="text-[11px] font-mono text-muted">in {sections.length} sections</span>
            </div>

            {showFileName && (
              <p className="text-xs text-muted truncate pt-0.5">
                <span className="font-mono uppercase tracking-wide text-[10px]">File</span>{' '}
                <span className="text-foreground font-semibold">{file.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
            {showExport && (
              <>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-subtle bg-white hover:bg-card-strong text-[11px] font-semibold text-muted-strong hover:text-foreground transition-all shadow-subtle"
                  title="Copy the full metadata report as JSON"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-brand" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-subtle bg-white hover:bg-card-strong text-[11px] font-semibold text-muted-strong hover:text-foreground transition-all shadow-subtle"
                  title="Download the metadata as a CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-muted" />
                  <span>CSV</span>
                </button>
              </>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card-strong transition-colors"
                title="Close metadata"
                aria-label="Close metadata"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* AI Footprint */}
        <div className={`rounded-xl border p-4 ${riskStyles.wrap}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <RiskIcon className={`w-5 h-5 ${riskStyles.text}`} />
              <div>
                <p className={`text-sm font-bold ${riskStyles.text}`}>
                  AI Footprint: {aiSignals.length === 0 ? '0' : aiSignals.length}
                </p>
                <p className={`text-xs ${riskStyles.text}`}>
                  {aiRisk === 'none' ? 'No AI traces found' : 'AI / provenance signals detected'}
                </p>
              </div>
            </div>
            {presentLabels.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {presentLabels.map((label) => (
                  <span
                    key={label}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/60 border ${riskStyles.text} border-current/20`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {aiSignals.length > 0 && (
            <ul className="mt-3 space-y-1">
              {aiSignals.map((signal, idx) => (
                <li key={idx} className={`text-xs ${riskStyles.text} flex items-start gap-1.5`}>
                  <span className="mt-1 w-1 h-1 rounded-full bg-current shrink-0" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          )}

          {notPresent.length > 0 && (
            <p className="mt-3 text-[11px] text-muted leading-relaxed">
              <span className="font-semibold text-muted-strong">Not present in this file: </span>
              {notPresent.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="p-6 sm:p-7 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold text-muted">
              By section · select to expand
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {sections.map((section) => {
                const isOpen = !!openSections[section.id];
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                      isOpen
                        ? 'bg-brand-soft border-brand/20 text-brand'
                        : 'bg-card-raised border-subtle text-muted hover:text-foreground hover:bg-card-strong/60'
                    }`}
                  >
                    <span>{section.shortTitle || section.title}</span>
                    <span className="font-mono text-[10px] opacity-80">{section.fields.length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setAllSections(true)}
              className="text-brand hover:underline"
            >
              Expand all
            </button>
            <span className="h-3 w-px bg-subtle" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setAllSections(false)}
              className="text-muted hover:text-foreground hover:underline"
            >
              Collapse all
            </button>
          </div>
        </div>

        {sections.map((section) => {
          const isOpen = !!openSections[section.id];
          return (
            <div key={section.id} className="border border-subtle rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-card-raised hover:bg-card-strong/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center text-brand shrink-0">
                    {section.id === 'file' ? <FileText className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{section.title}</p>
                    <p className="text-[11px] text-muted truncate">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-muted">{section.fields.length} fields</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180 text-brand' : ''}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="overflow-x-auto border-t border-subtle/60">
                  <table className="w-full text-left text-xs font-mono">
                    <tbody className="divide-y divide-subtle/50">
                      {section.fields.length > 0 ? (
                        section.fields.map((field, idx) => (
                          <tr key={`${field.key}-${idx}`} className="hover:bg-card-raised/60 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-foreground whitespace-nowrap align-top w-1/3">
                              {field.key}
                            </td>
                            <td className="py-2.5 px-4 text-muted-strong break-all">
                              {field.value === '' || field.value === null || field.value === undefined
                                ? '—'
                                : String(field.value)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-4 px-4 text-center text-muted" colSpan={2}>
                            No fields in this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-start gap-2 pt-1 text-[11px] text-muted">
          <Info className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
          <span>Parsed 100% in your browser. Nothing is uploaded to a server.</span>
        </div>
      </div>
    </div>
  );
}
