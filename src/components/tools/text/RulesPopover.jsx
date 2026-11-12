import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const RULES = [
  {
    key: 'normalizeSpaces',
    label: 'Normalise spaces',
    hint: 'NBSP, thin spaces and doubled spaces become one space.',
  },
  {
    key: 'normalizePunctuation',
    label: 'Straighten typography',
    hint: 'Curly quotes, ellipses and fullwidth marks become ASCII.',
  },
  {
    key: 'foldLetters',
    label: 'Fold lookalike letters',
    hint: 'Cyrillic and Greek letters inside Latin words only.',
  },
  {
    key: 'stripBidi',
    label: 'Strip bidi controls',
    hint: 'Trojan-source overrides. Can affect real right-to-left text.',
  },
  {
    key: 'stripAiMetadata',
    label: 'Strip AI metadata lines',
    hint: 'Removes generator: lines and <meta name="generator"> tags.',
  },
  {
    key: 'stripAiLinks',
    label: 'Strip AI link tags',
    hint: 'Drops utm_source=chatgpt.com and similar parameters.',
  },
  {
    key: 'stripChatMarkers',
    label: 'Strip chat-export markers',
    hint: 'Removes :contentReference[oaicite:…] and similar residue.',
  },
  {
    key: 'preserveMarkdown',
    label: 'Protect code and URLs',
    hint: 'Fenced blocks, inline code, links and emails stay byte-identical.',
  },
  {
    key: 'preserveEmoji',
    label: 'Preserve emoji',
    hint: 'Keeps joiners, variation selectors and tag characters inside glyphs.',
  },
];

export default function RulesPopover({ open, onClose, options, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Cleaning rules"
      className="absolute right-0 top-full z-30 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl border border-subtle bg-white shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
          Rules
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close rules"
          className="text-muted hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-[62vh] overflow-y-auto p-2">
        {RULES.map((rule) => (
          <label
            key={rule.key}
            className="flex items-start gap-2.5 rounded-lg px-2 py-2 cursor-pointer hover:bg-card-raised"
          >
            <input
              type="checkbox"
              checked={Boolean(options[rule.key])}
              onChange={() => onChange(rule.key, !options[rule.key])}
              className="mt-0.5 w-3.5 h-3.5 rounded text-brand focus:ring-brand"
            />
            <span className="text-[11px] leading-snug">
              <span className="block font-semibold text-foreground">{rule.label}</span>
              <span className="block text-[10px] text-muted mt-0.5">{rule.hint}</span>
            </span>
          </label>
        ))}

        <div className="flex items-center justify-between gap-3 px-2 pt-2 pb-1 mt-1 border-t border-subtle">
          <span className="text-[11px] font-semibold text-foreground">Dash style</span>
          <select
            value={options.dashStyle}
            onChange={(event) => onChange('dashStyle', event.target.value)}
            className="w-36 px-2 py-1 rounded-lg border border-subtle bg-card-raised text-[11px] text-foreground focus:outline-none focus:border-brand"
          >
            <option value="hyphen">Spaced hyphen</option>
            <option value="comma">Comma</option>
            <option value="keep">Keep dashes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
