import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/format';
import { formatLabel } from '../../utils/fileValidation';
import UploadProgressBar from './UploadProgressBar';

function fileFormatLabel(file) {
  if (file.format) return formatLabel(file.format);
  const ext = file.name?.includes('.') ? file.name.split('.').pop() : '';
  return ext ? ext.toUpperCase() : 'IMAGE';
}

function statusMeta(file) {
  switch (file.status) {
    case 'uploading':
      return { label: 'Uploading', tone: 'scanning', icon: Loader2 };
    case 'processing':
      return { label: 'Scanning', tone: 'scanning', icon: Loader2 };
    case 'cleaned':
      return { label: 'Cleaned', tone: 'cleaned', icon: CheckCircle2 };
    case 'error':
      return { label: 'Failed', tone: 'error', icon: AlertCircle };
    default:
      return { label: 'Uploaded', tone: 'ready', icon: CheckCircle2 };
  }
}

const TONE_CLASSES = {
  ready: 'bg-card-strong text-muted-strong border-subtle',
  scanning: 'bg-brand-soft text-brand border-brand/20',
  cleaned: 'bg-risk-emerald-bg text-risk-emerald-text border-risk-emerald-border',
  error: 'bg-risk-rose-bg text-risk-rose-text border-risk-rose-border',
};

/**
 * Read-only file list for the View Metadata page.
 * Mirrors the reference row layout: preview, filename, size · format · status,
 * View Metadata toggle, Cancel.
 */
export default function ViewFileList({ openFileId, onToggleMetadata, onRemoved }) {
  const { files, removeFile, retryFile, maxFiles } = useWorkspace();

  if (!files || files.length === 0) return null;

  const handleRemove = (id) => {
    removeFile(id);
    if (onRemoved) onRemoved(id);
  };

  return (
    <div className="bg-white rounded-panel border border-subtle shadow-subtle overflow-hidden animate-fadeIn">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 border-b border-subtle/60">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-muted">
          File Preview
        </span>
        <span className="text-[11px] font-mono text-muted">
          {files.length} of {maxFiles} files
        </span>
      </div>

      <div className="divide-y divide-subtle/60">
        {files.map((file) => {
          const isOpen = openFileId === file.id;
          const isScanning = file.status === 'uploading' || file.status === 'processing';
          const isError = file.status === 'error';
          const hasMetadata = !!file.metadata && (file.status === 'uploaded' || file.status === 'cleaned');
          const status = statusMeta(file);
          const StatusIcon = status.icon;

          return (
            <div
              key={file.id}
              className={`px-5 sm:px-6 py-4 transition-colors ${
                isOpen ? 'bg-brand-soft/25' : 'hover:bg-card-raised/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-card-strong border border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-muted">IMG</span>
                    )}
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                      {fileFormatLabel(file)}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <p className="font-bold text-[14px] sm:text-[15px] text-foreground truncate max-w-[240px] sm:max-w-md">
                      {file.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-muted">
                      <span>{formatBytes(file.size)}</span>
                      <span className="text-subtle">·</span>
                      <span>{fileFormatLabel(file)}</span>
                      <span className="text-subtle">·</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-bold ${TONE_CLASSES[status.tone]}`}
                      >
                        <StatusIcon className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                        {status.label}
                      </span>
                    </div>

                    {isError && file.error && (
                      <p className="text-[11px] text-risk-rose-text font-medium">{file.error}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {hasMetadata && (
                    <button
                      type="button"
                      onClick={() => onToggleMetadata(file)}
                      aria-expanded={isOpen}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isOpen
                          ? 'bg-brand text-white border-brand hover:bg-brand-hover'
                          : 'bg-white text-muted-strong hover:text-foreground border-subtle hover:bg-card-strong'
                      }`}
                    >
                      {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isOpen ? 'Hide Metadata' : 'View Metadata'}</span>
                    </button>
                  )}

                  {isScanning && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-subtle bg-card-strong text-muted/60 cursor-not-allowed"
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning…</span>
                    </button>
                  )}

                  {isError && (
                    <button
                      type="button"
                      onClick={() => retryFile(file.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-card-strong text-muted-strong hover:text-foreground text-xs font-semibold border border-subtle transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-risk-rose-text hover:bg-risk-rose-bg transition-colors"
                    title={`Cancel ${file.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>

              {(isScanning || isError) && (
                <div className="mt-3">
                  <UploadProgressBar
                    progress={file.progress || 0}
                    status={isError ? 'error' : 'uploading'}
                    label={file.stageLabel || (isError ? 'Failed' : 'Reading metadata…')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
