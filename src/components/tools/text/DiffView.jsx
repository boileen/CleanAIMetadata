import React from 'react';

/**
 * Renders a diff as inline coloured spans inside a pre-formatted block.
 *
 * keep   → plain text
 * remove → red background, strikethrough
 * insert → green background
 * change → yellow chip showing `from → to`
 */
export default function DiffView({ ops, placeholder }) {
  if (!ops || !ops.length) {
    return (
      <div className="h-[16rem] sm:h-[19rem] overflow-auto p-3.5 font-editor text-xs sm:text-[13px] leading-relaxed text-muted">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="h-[16rem] sm:h-[19rem] overflow-auto p-3.5 font-editor text-xs sm:text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words select-text">
      {ops.map((op, index) => {
        if (op.type === 'keep') {
          return <span key={index}>{op.text}</span>;
        }

        if (op.type === 'remove') {
          // If the removed text is entirely invisible (renders as nothing),
          // show a small labelled chip so the user can see what was removed.
          const isInvisible = [...op.text].every((char) => {
            const cp = char.codePointAt(0);
            return (
              cp === 0x200b || cp === 0x200c || cp === 0x200d ||
              cp === 0x2060 || cp === 0xfeff || cp === 0x00ad ||
              cp === 0x180e || (cp >= 0x202a && cp <= 0x202e) ||
              (cp >= 0x2066 && cp <= 0x2069) ||
              (cp >= 0xe0020 && cp <= 0xe007f)
            );
          });

          if (isInvisible) {
            const labels = [...op.text].map((char) => {
              const cp = char.codePointAt(0);
              const names = {
                0x200b: 'ZWSP', 0x200c: 'ZWNJ', 0x200d: 'ZWJ',
                0x2060: 'WJ', 0xfeff: 'BOM', 0x00ad: 'SHY', 0x180e: 'MVS',
              };
              return names[cp] || (cp >= 0xe0020 && cp <= 0xe007f ? 'TAG' : `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
            });
            return (
              <span
                key={index}
                title={`Removed invisible: ${labels.join(', ')}`}
                className="inline-flex items-center gap-0.5 mx-0.5 align-baseline"
              >
                {labels.map((label, labelIndex) => (
                  <span
                    key={labelIndex}
                    className="bg-red-100 text-red-700 border border-red-200 rounded px-1 text-[9px] font-bold font-mono leading-tight"
                  >
                    {label}
                  </span>
                ))}
              </span>
            );
          }

          return (
            <span
              key={index}
              className="bg-red-100 text-red-700 line-through decoration-red-400 rounded-sm"
              title="Removed"
            >
              {op.text}
            </span>
          );
        }

        if (op.type === 'insert') {
          return (
            <span
              key={index}
              className="bg-emerald-100 text-emerald-800 rounded-sm"
              title="Added"
            >
              {op.text}
            </span>
          );
        }

        if (op.type === 'change') {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-0.5 mx-0.5 align-baseline"
              title={`Changed: "${op.from}" → "${op.to}"`}
            >
              <span className="bg-amber-100 text-amber-700 line-through decoration-amber-400 rounded-sm px-0.5">
                {op.from}
              </span>
              <span className="text-muted text-[9px]">→</span>
              <span className="bg-amber-50 text-amber-800 rounded-sm px-0.5 font-semibold">
                {op.to}
              </span>
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}
