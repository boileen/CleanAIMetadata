import React, { useEffect, useRef, useState } from 'react';

// Ease-toward-target constants. The bar always converges on the real progress
// value, but glides there frame-by-frame instead of jumping between updates.
const EASE = 0.09;
const MIN_STEP = 0.4;

/**
 * Thin progress bar used for upload/read and metadata-stripping progress.
 *
 * `progress` is the real value. The fill is animated with requestAnimationFrame
 * so even instant updates (small files) fill smoothly instead of snapping.
 */
export default function UploadProgressBar({
  progress = 0,
  status = 'uploading',
  label,
  showLabel = true,
}) {
  const target = Math.max(0, Math.min(100, progress));

  const [displayed, setDisplayed] = useState(target);
  const displayedRef = useRef(target);
  const frameRef = useRef(null);

  useEffect(() => {
    const current = displayedRef.current;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Snap when progress resets (retry) or the user prefers reduced motion.
    if (target <= current || prefersReducedMotion) {
      displayedRef.current = target;
      setDisplayed(target);
      return undefined;
    }

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const value = displayedRef.current;
      const diff = target - value;

      if (diff <= 0.05) {
        displayedRef.current = target;
        setDisplayed(target);
        frameRef.current = null;
        return;
      }

      // Quick at first, gentler near the end, with a floor so it never stalls.
      const step = Math.max(MIN_STEP, diff * EASE);
      const next = Math.min(target, value + step);
      displayedRef.current = next;
      setDisplayed(next);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [target]);

  const value = Math.round(displayed);

  const isError = status === 'error';
  const isCleaned = status === 'cleaned';
  const barColor = isError
    ? 'bg-risk-rose-text'
    : isCleaned
      ? 'bg-risk-emerald-text'
      : 'bg-brand';

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
          <span className={isError ? 'text-risk-rose-text' : 'text-muted'}>
            {label || (isError ? 'Failed' : isCleaned ? 'Verified clean' : 'Processing…')}
          </span>
          <span className={isError ? 'text-risk-rose-text' : 'text-muted'}>{value}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full rounded-full bg-card-strong overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  );
}
