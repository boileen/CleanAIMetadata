import React, { useRef, useState } from 'react';
import { CloudUpload, ImagePlus } from 'lucide-react';

const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif,image/avif,.jpg,.jpeg,.png,.webp,.tif,.tiff,.heic,.heif,.avif';

export { ACCEPTED_IMAGE_TYPES };

export default function EditDropzone({ onFiles, onBrowse, error }) {
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const files = event.dataTransfer?.files;
    if (files?.length) onFiles(files);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-panel border border-subtle p-5 sm:p-7 shadow-subtle">
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            event.preventDefault();
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragging(false);
          }}
          onDrop={handleDrop}
          onClick={onBrowse}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onBrowse();
            }
          }}
          className={`rounded-2xl border-2 border-dashed p-8 sm:p-14 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            dragging
              ? 'border-brand bg-brand-soft/60 scale-[1.005]'
              : 'border-subtle bg-card-raised/70 hover:border-subtle-hover hover:bg-card-strong/30'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center text-brand shadow-sm">
            <CloudUpload className="w-7 h-7" strokeWidth={1.75} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Drop one photo here to edit its metadata
            </h2>
            <p className="text-xs sm:text-[13px] text-muted">
              JPEG, PNG and WebP are fully editable · up to 100 MB
            </p>
          </div>

          <div className="flex items-center gap-3 w-full max-w-[15rem]">
            <span className="h-px flex-1 bg-subtle" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted">or</span>
            <span className="h-px flex-1 bg-subtle" />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBrowse();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-[14px] font-bold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <ImagePlus className="w-4 h-4" />
            Choose a photo
          </button>

          <p className="text-[11px] text-muted max-w-sm leading-relaxed">
            TIFF, HEIC and AVIF can be opened for inspection, but metadata editing is
            currently limited to JPEG, PNG and WebP so nothing is silently converted.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-risk-rose-border bg-risk-rose-bg px-4 py-3 text-[12px] font-medium text-risk-rose-text">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5 sm:gap-7 px-2 text-xs text-muted font-medium justify-start -mt-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          100% Free
        </span>

        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          No installation required
        </span>

        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          Secure & private
        </span>
      </div>
    </div>
  );
}
