import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck2,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { formatBytes } from '../../../utils/format';

export default function EditorResult({
  status,
  result,
  verification,
  error,
  onDownload,
  onProcess,
  onResetAll,
}) {
  if (status === 'processing') {
    return (
      <section className="flex items-center gap-3 rounded-panel border border-subtle bg-white p-4 shadow-subtle">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
        <div>
          <p className="text-xs font-bold text-foreground">Writing metadata…</p>
          <p className="text-[11px] text-muted">
            Pixels stay untouched. The output will be read back and checked.
          </p>
        </div>
      </section>
    );
  }

  if (error && !result) {
    return (
      <section className="rounded-panel border border-risk-rose-border bg-risk-rose-bg p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-risk-rose-text">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-risk-rose-text">
              Metadata could not be written
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-risk-rose-text/90">
              {error}
            </p>
            <button
              type="button"
              onClick={onProcess}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-risk-rose-text shadow-subtle transition-transform hover:-translate-y-0.5"
            >
              <RotateCcw className="h-3 w-3" />
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!result) return null;

  const verified = verification?.ok;
  const checked = verification?.checked || 0;
  const passed = verification?.passed || 0;
  const failedFields = verification?.fields?.filter((field) => !field.ok) || [];

  return (
    <section
      id="editor-result"
      className={`rounded-panel border p-4 shadow-subtle sm:p-5 ${
        verified
          ? 'border-brand/20 bg-brand-soft/40'
          : 'border-risk-amber-border bg-risk-amber-bg/70'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${
              verified ? 'text-brand' : 'text-risk-amber-text'
            }`}
          >
            {verified ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <h2
              className={`text-sm font-bold ${
                verified ? 'text-brand' : 'text-risk-amber-text'
              }`}
            >
              {verified
                ? 'Metadata written and verified'
                : 'Written, but some fields need attention'}
            </h2>
            <p
              className={`mt-1 text-[11px] leading-relaxed ${
                verified ? 'text-brand/80' : 'text-risk-amber-text/90'
              }`}
            >
              {checked > 0
                ? `${passed} of ${checked} selected field${checked === 1 ? '' : 's'} matched after re-reading the file.`
                : 'No fields were selected, so the metadata carriers were rebuilt empty.'}
              {verification?.readError ? ` ${verification.readError}` : ''}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-[10px] font-semibold text-muted-strong">
                <FileCheck2 className="h-3 w-3" />
                {formatBytes(result.size)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-[10px] font-semibold text-muted-strong">
                <ShieldCheck className="h-3 w-3" />
                {verification?.iccPresent
                  ? 'ICC profile preserved'
                  : 'No ICC profile in output'}
              </span>
              {result.name && (
                <span className="max-w-full truncate rounded-md bg-white/80 px-2 py-1 font-mono text-[10px] font-semibold text-muted">
                  {result.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-subtle bg-white px-3.5 py-2.5 text-[11px] font-semibold text-muted-strong transition-colors hover:bg-card-strong"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            <Download className="h-4 w-4" />
            Download edited photo
          </button>
        </div>
      </div>

      {failedFields.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-risk-amber-border bg-white">
          <div className="border-b border-risk-amber-border/70 px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-risk-amber-text">
            Fields that did not match on read-back
          </div>
          <div className="max-h-56 divide-y divide-subtle/60 overflow-y-auto">
            {failedFields.map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-1 px-3 py-2 text-[11px] sm:grid-cols-3 sm:gap-3"
              >
                <span className="font-semibold text-foreground">
                  {field.label}
                  <span className="ml-1 font-mono text-[9px] font-normal text-muted">
                    {field.tabs?.join('/') || field.tab}
                  </span>
                </span>
                <span className="truncate text-muted" title={field.expected}>
                  Expected: <code className="font-mono">{field.expected}</code>
                </span>
                <span className="truncate text-risk-amber-text" title={field.actual}>
                  Read: <code className="font-mono">{field.actual || 'empty'}</code>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        The read-back check uses the same browser parser as the View Metadata tool. Some
        viewers label or group the same tags differently, but the downloaded file keeps
        the values shown above.
      </p>
    </section>
  );
}
