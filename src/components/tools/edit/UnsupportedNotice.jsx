import React from 'react';
import { AlertTriangle, Image as ImageIcon, RefreshCw, ShieldCheck } from 'lucide-react';

export default function UnsupportedNotice({ previewUrl, fileInfo, onBrowse, onResetAll }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="overflow-hidden rounded-panel border border-subtle bg-white shadow-subtle">
        <div className="relative aspect-[4/3] bg-card-strong">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={fileInfo?.name || 'Selected photo'}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageIcon className="h-7 w-7" />
            </div>
          )}
          <span className="absolute right-2.5 top-2.5 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            {fileInfo?.formatLabel || 'IMAGE'}
          </span>
        </div>
        <div className="p-4">
          <h2 className="truncate text-sm font-bold text-foreground" title={fileInfo?.name}>
            {fileInfo?.name}
          </h2>
          <p className="mt-0.5 font-mono text-[11px] text-muted">{fileInfo?.size}</p>
        </div>
      </div>

      <div className="rounded-panel border border-risk-amber-border bg-risk-amber-bg/70 p-5 shadow-subtle sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-risk-amber-text">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-risk-amber-text">
              {fileInfo?.formatLabel || 'This format'} editing is not available yet
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-risk-amber-text/90">
              This editor writes metadata losslessly for JPEG, PNG and WebP only. We do
              not silently convert {fileInfo?.formatLabel || 'this file'} or re-encode its
              pixels, because that would change the image you asked us to preserve.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {['JPEG', 'PNG', 'WebP'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-[10px] font-bold text-brand"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {label} supported
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onBrowse}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                <RefreshCw className="h-4 w-4" />
                Choose a JPEG, PNG or WebP
              </button>
              <button
                type="button"
                onClick={onResetAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-subtle bg-white px-4 py-2.5 text-[12px] font-semibold text-muted-strong transition-colors hover:bg-card-strong"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
