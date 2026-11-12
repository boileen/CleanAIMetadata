import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ImagePlus, Loader2, MonitorUp, Check } from 'lucide-react';
import GoogleDriveIcon from '../brand/GoogleDriveIcon';

/**
 * Split upload control: primary local-file button + source dropdown.
 *
 * The dropdown exists so more sources (Drive today, Dropbox/OneDrive later) can
 * be added without changing the visual weight of the page. Google Drive is the
 * only remote source, and it is entirely optional: when the build has no
 * Google credentials the row is shown as disabled instead of disappearing, so
 * the layout stays stable.
 */
export default function UploadSourceMenu({
  label = 'Choose a photo',
  onBrowse,
  onDrive,
  driveConfigured = false,
  busy = false,
  busyLabel = 'Connecting…',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        containerRef.current?.querySelector('[data-source-trigger]')?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) menuRef.current?.querySelector('[data-menu-item]')?.focus();
  }, [open]);

  const pickLocal = () => {
    setOpen(false);
    onBrowse?.();
  };

  const pickDrive = () => {
    if (!driveConfigured || busy) return;
    setOpen(false);
    onDrive?.();
  };

  const handleMenuKeyDown = (event) => {
    const items = Array.from(menuRef.current?.querySelectorAll('[data-menu-item]') || []);
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      {/* Split button: shared shell so the two halves read as one control */}
      <div
        className={`inline-flex items-stretch rounded-xl bg-brand shadow-sm overflow-visible transition-transform ${
          busy ? '' : 'hover:-translate-y-0.5'
        }`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBrowse?.();
          }}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 pl-6 pr-5 py-3 rounded-l-xl text-[14px] font-bold text-white hover:bg-brand-hover transition-colors disabled:cursor-not-allowed disabled:opacity-80"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
          {busy ? busyLabel : label}
        </button>

        <span aria-hidden="true" className="w-px my-2 bg-white/25" />

        <button
          type="button"
          data-source-trigger
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Choose an upload source"
          className="inline-flex items-center justify-center pl-2.5 pr-3 rounded-r-xl text-white hover:bg-brand-hover transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Upload source"
          onKeyDown={handleMenuKeyDown}
          onClick={(event) => event.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 top-full z-30 mt-2 w-[19rem] rounded-xl border border-subtle bg-white p-1.5 shadow-unheic"
        >
          <button
            type="button"
            role="menuitem"
            data-menu-item
            onClick={(event) => {
              event.stopPropagation();
              pickLocal();
            }}
            className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-card-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span className="mt-0.5 w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <MonitorUp className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                My device
                <Check className="w-3.5 h-3.5 text-brand" />
              </span>
              <span className="block text-[11px] text-muted leading-snug">
                JPEG, PNG, WebP, TIFF, HEIC
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            data-menu-item
            onClick={(event) => {
              event.stopPropagation();
              pickDrive();
            }}
            disabled={!driveConfigured || busy}
            title={
              driveConfigured
                ? undefined
                : 'Google Drive needs VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY to be configured.'
            }
            className={`w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
              !driveConfigured || busy
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-card-strong'
            }`}
          >
            <span className="mt-0.5 w-8 h-8 rounded-lg border border-subtle bg-white flex items-center justify-center shrink-0">
              <GoogleDriveIcon className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                Google Drive
                {!driveConfigured && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-muted bg-card-strong border border-subtle px-1.5 py-0.5 rounded">
                    Setup required
                  </span>
                )}
              </span>
              <span className="block text-[11px] text-muted leading-snug">
                Pick an image already saved in your Drive
              </span>
            </span>
          </button>

          <p className="mt-1 border-t border-subtle px-3 pt-2 pb-1 text-[10.5px] leading-snug text-muted">
            {driveConfigured
              ? 'Drive files load straight into this tab — nothing passes through us.'
              : 'Add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY to .env.local to enable Drive.'}
          </p>
        </div>
      )}
    </div>
  );
}
