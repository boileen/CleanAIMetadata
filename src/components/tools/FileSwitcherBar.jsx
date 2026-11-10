import React from 'react';
import { Plus } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function FileSwitcherBar({ onAddMoreClick }) {
  const { files, activeFileId, setActiveFileId } = useWorkspace();

  if (!files || files.length === 0) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-subtle shadow-subtle flex items-center gap-2 overflow-x-auto">
      {files.map((file) => {
        const isActive = file.id === activeFileId;
        return (
          <button
            key={file.id}
            type="button"
            onClick={() => setActiveFileId(file.id)}
            className={`shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-left ${
              isActive
                ? 'bg-card-strong border-subtle-hover shadow-subtle'
                : 'bg-card-raised hover:bg-card-strong/60 border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-subtle overflow-hidden shrink-0 flex items-center justify-center">
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-mono font-bold text-muted">IMG</span>
              )}
            </div>

            <div className="flex flex-col min-w-0 pr-1">
              <span className={`text-[13px] truncate max-w-[140px] leading-tight ${
                isActive ? 'font-bold text-foreground' : 'font-medium text-muted-strong'
              }`}>
                {file.name}
              </span>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wide">
                {formatBytes(file.size)}
              </span>
            </div>
          </button>
        );
      })}

      {/* Upload More Button */}
      {files.length < 5 && (
        <button
          type="button"
          onClick={onAddMoreClick}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-subtle hover:border-brand text-xs font-semibold text-muted hover:text-brand transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Photo</span>
        </button>
      )}
    </div>
  );
}
