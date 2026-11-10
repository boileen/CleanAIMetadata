import React, { useMemo } from 'react';
import {
  Trash2,
  Download,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/format';
import { formatLabel } from '../../utils/fileValidation';
import { triggerDownload } from '../../utils/zipDownloader';
import UploadProgressBar from '../tools/UploadProgressBar';

function outputName(file) {
  if (!file.lossless && file.format && file.format !== 'png') {
    return `${file.name.replace(/\.[^.]+$/, '')}.png`;
  }
  return file.name;
}

export default function FileQueueCard() {
  const {
    files,
    removeFile,
    clearAllFiles,
    totalBytes,
    maxFiles,
    setActiveFileId,
    activeFileId,
    cleanFile,
    retryFile,
  } = useWorkspace();

  const summary = useMemo(() => {
    const uploadedBytes = files.reduce((sum, f) => {
      if (f.status === 'uploaded' || f.status === 'cleaned' || f.status === 'error') {
        return sum + (f.size || 0);
      }
      return sum + Math.round((f.size || 0) * ((f.progress || 0) / 100));
    }, 0);

    return {
      uploadedBytes,
      overall: totalBytes ? Math.round((uploadedBytes / totalBytes) * 100) : 0,
      uploading: files.some((f) => f.status === 'uploading' || f.status === 'processing'),
      cleanedCount: files.filter((f) => f.status === 'cleaned').length,
      errorCount: files.filter((f) => f.status === 'error').length,
    };
  }, [files, totalBytes]);

  if (!files || files.length === 0) return null;

  const { uploadedBytes, overall, uploading, cleanedCount, errorCount } = summary;
  const allCleaned = cleanedCount === files.length && files.length > 0;

  const headerStatus = uploading
    ? 'Processing'
    : allCleaned
      ? 'Verified clean'
      : 'File uploaded';

  const overallStatus = uploading
    ? 'uploading'
    : allCleaned
      ? 'cleaned'
      : errorCount === files.length
        ? 'error'
        : 'uploaded';

  return (
    <div className="bg-white rounded-panel border border-subtle p-6 sm:p-7 shadow-subtle space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-subtle/60">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-2 text-brand font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className={`w-1.5 h-1.5 rounded-full bg-brand ${uploading ? 'animate-pulse' : ''}`} />
            {headerStatus}
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {files.length} {files.length === 1 ? 'file' : 'files'} ·{' '}
            {formatBytes(uploadedBytes)} of {formatBytes(totalBytes)}
          </h3>
          <p className="text-xs sm:text-[13px] text-muted">
            Lossless byte rewrite without visual compression degradation. All in browser memory.
          </p>
        </div>

        <button
          type="button"
          onClick={clearAllFiles}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle hover:border-risk-rose-border hover:bg-risk-rose-bg text-muted-strong hover:text-risk-rose-text text-xs sm:text-[13px] font-semibold transition-all shrink-0 self-start"
        >
          <Trash2 className="w-4 h-4" />
          <span>Cancel all</span>
        </button>
      </div>

      {/* Overall progress */}
      <UploadProgressBar
        progress={overall}
        status={overallStatus}
        label={
          uploading
            ? 'Reading & scanning files…'
            : `${formatBytes(uploadedBytes)} of ${formatBytes(totalBytes)}`
        }
      />

      {/* File list */}
      <div className="space-y-3">
        {files.map((file) => {
          const isActive = activeFileId === file.id;
          const isUploaded = file.status === 'uploaded';
          const isProcessing = file.status === 'processing' || file.status === 'uploading';
          const isCleaned = file.status === 'cleaned';
          const isError = file.status === 'error';
          const isAiHigh = file.aiRisk === 'high';

          const statusLabel = isCleaned
            ? 'Cleaned'
            : isError
              ? 'Error'
              : isProcessing
                ? (file.status === 'uploading' ? 'Uploading' : 'Cleaning')
                : 'Uploaded';

          const statusClasses = isCleaned
            ? 'bg-risk-emerald-bg text-risk-emerald-text border-risk-emerald-border'
            : isError
              ? 'bg-risk-rose-bg text-risk-rose-text border-risk-rose-border'
              : isProcessing
                ? 'bg-brand-soft text-brand border-brand/20'
                : 'bg-card-strong text-muted-strong border-subtle';

          return (
            <div
              key={file.id}
              className={`group relative bg-card-raised hover:bg-white border rounded-xl p-4 sm:p-5 transition-all shadow-subtle space-y-3 ${
                isActive ? 'border-brand/40 ring-1 ring-brand/10' : 'border-subtle hover:border-subtle-hover'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Thumbnail + info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-card-strong border border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                    {file.previewUrl ? (
                      <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-mono font-bold text-muted">IMG</span>
                    )}
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                      {formatLabel(file.format || (file.type ? file.type.split('/')[1] : ''))}
                    </span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[14px] sm:text-[15px] text-foreground truncate max-w-[220px] sm:max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-xs font-mono text-muted shrink-0">
                        {formatBytes(file.size)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-mono text-[11px] font-bold ${statusClasses}`}>
                        {isCleaned ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isError ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : isProcessing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isAiHigh ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {statusLabel}
                      </span>

                      {(isUploaded || isCleaned) && (
                        <span className="text-[11px] font-mono text-muted">
                          {file.totalTagCount || 0} embedded tags
                        </span>
                      )}

                      {isCleaned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-risk-emerald-text font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {file.removedTagCount || 0} tags removed
                        </span>
                      )}
                    </div>

                    {isError && file.error && (
                      <p className="text-[11px] text-risk-rose-text font-medium">{file.error}</p>
                    )}

                    {/* Detected signals preview */}
                    {!isError && file.detectedAiSignals && file.detectedAiSignals.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {file.detectedAiSignals.slice(0, 2).map((sig, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-risk-rose-bg/60 border border-risk-rose-border text-[11px] font-mono text-risk-rose-text"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {(isUploaded || isCleaned) && (
                    <button
                      type="button"
                      onClick={() => setActiveFileId(file.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-strong hover:text-foreground bg-white hover:bg-card-strong border border-subtle transition-all flex items-center gap-1.5"
                    >
                      <span>View Metadata</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted" />
                    </button>
                  )}

                  {isUploaded && (
                    <button
                      type="button"
                      onClick={() => cleanFile(file.id)}
                      className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Clean &amp; Download</span>
                    </button>
                  )}

                  {isCleaned && (
                    <button
                      type="button"
                      onClick={() => triggerDownload(file.cleanedBlob, outputName(file))}
                      className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}

                  {isError && (
                    <button
                      type="button"
                      onClick={() => retryFile(file.id)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-card-strong text-muted-strong hover:text-foreground text-xs font-semibold border border-subtle transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-2 rounded-xl text-muted hover:text-risk-rose-text hover:bg-risk-rose-bg transition-colors"
                    title="Remove this file"
                    aria-label="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Per-file progress bar while reading/cleaning */}
              {(isProcessing || isError) && (
                <UploadProgressBar
                  progress={file.progress || 0}
                  status={isError ? 'error' : 'uploading'}
                  label={file.stageLabel || (isError ? 'Failed' : 'Processing…')}
                />
              )}

              {isCleaned && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted">
                  <span>
                    {formatBytes(file.size)} → {formatBytes(file.cleanedSize ?? file.size)}
                    {!file.lossless && (
                      <span className="ml-2 text-risk-amber-text">re-encoded</span>
                    )}
                  </span>
                  <span className="text-risk-emerald-text">✓ Verified clean</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
