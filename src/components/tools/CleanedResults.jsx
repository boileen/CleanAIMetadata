import React, { useMemo } from 'react';
import { CheckCircle2, Download, Archive, RotateCcw, FileCheck2 } from 'lucide-react';
import { formatBytes } from '../../utils/format';
import { formatLabel } from '../../utils/fileValidation';
import { downloadZip, triggerDownload } from '../../utils/zipDownloader';
import { useWorkspace } from '../../context/WorkspaceContext';

function outputName(file) {
  if (!file.lossless && file.format && file.format !== 'png') {
    return `${file.name.replace(/\.[^.]+$/, '')}.png`;
  }
  return file.name;
}

export default function CleanedResults() {
  const { files, clearAllFiles } = useWorkspace();

  const cleanedFiles = useMemo(
    () => files.filter((f) => f.status === 'cleaned' && f.cleanedBlob),
    [files],
  );

  const totalSaved = useMemo(
    () => cleanedFiles.reduce((sum, f) => sum + Math.max(0, (f.size || 0) - (f.cleanedSize || 0)), 0),
    [cleanedFiles],
  );

  const handleDownload = (file) => {
    triggerDownload(file.cleanedBlob, outputName(file));
  };

  const handleZip = () => {
    downloadZip(cleanedFiles);
  };

  if (!cleanedFiles.length) return null;

  return (
    <div className="bg-white rounded-panel border border-subtle shadow-subtle overflow-hidden animate-fadeIn">
      <div className="p-6 sm:p-7 border-b border-subtle/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-risk-emerald-text">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified clean
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Your cleaned images
            </h2>
            <p className="text-xs sm:text-[13px] text-muted">
              {cleanedFiles.length} {cleanedFiles.length === 1 ? 'image' : 'images'} · AI labels,
              C2PA, XMP, IPTC, EXIF, GPS, and timestamps removed
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {cleanedFiles.length > 1 && (
              <button
                type="button"
                onClick={handleZip}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-card-strong border border-subtle text-foreground text-xs sm:text-[13px] font-semibold transition-all shadow-subtle"
              >
                <Archive className="w-4 h-4 text-muted" />
                <span>Download All (.zip)</span>
              </button>
            )}
            <button
              type="button"
              onClick={clearAllFiles}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-[13px] font-bold shadow-sm transition-all hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clean more images</span>
            </button>
          </div>
        </div>

        {totalSaved > 0 && (
          <p className="text-[11px] font-mono text-risk-emerald-text">
            ✓ {formatBytes(totalSaved)} of hidden metadata removed across this batch
          </p>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {cleanedFiles.map((file) => (
          <div
            key={file.id}
            className="bg-card-raised border border-subtle rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-14 h-14 rounded-xl bg-card-strong border border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                {file.cleanedUrl ? (
                  <img src={file.cleanedUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <FileCheck2 className="w-6 h-6 text-brand" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <p className="text-sm sm:text-[15px] font-bold text-foreground truncate max-w-[260px] sm:max-w-md">
                  {outputName(file)}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="text-muted">
                    {formatBytes(file.cleanedSize ?? file.size)} · {formatLabel(file.format)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-emerald-bg text-risk-emerald-text border border-risk-emerald-border font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {file.removedTagCount || 0} tags removed
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      file.lossless
                        ? 'bg-brand-soft text-brand'
                        : 'bg-risk-amber-bg text-risk-amber-text border border-risk-amber-border'
                    }`}
                  >
                    {file.lossless ? 'Lossless' : 'Re-encoded'}
                  </span>
                </div>
                {file.cleanedSize != null && file.size ? (
                  <p className="text-[11px] font-mono text-muted">
                    {formatBytes(file.size)} → {formatBytes(file.cleanedSize)}
                    {file.size > file.cleanedSize
                      ? ` · saved ${formatBytes(file.size - file.cleanedSize)}`
                      : ''}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleDownload(file)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-[13px] font-bold shadow-sm transition-all hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
