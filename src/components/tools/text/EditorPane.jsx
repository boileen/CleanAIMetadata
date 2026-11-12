import React from 'react';

export default function EditorPane({
  label,
  meta,
  actions,
  value,
  onChange,
  placeholder,
  readOnly = false,
  revealed = null,
  emptyHint,
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-subtle bg-card-raised/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {meta && <span className="font-mono text-[10px] text-muted">{meta}</span>}
          {actions}
        </div>
      </div>

      <div className="relative flex-1">
        {revealed ? (
          <div className="h-[16rem] sm:h-[19rem] overflow-auto p-3.5 font-editor text-[12px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {revealed.length === 0 ? (
              <span className="text-muted">{emptyHint}</span>
            ) : (
              revealed.map((segment, index) =>
                segment.type === 'marker' ? (
                  <span
                    key={index}
                    title={`${segment.name} (${segment.code})`}
                    className="inline-flex items-center mx-0.5 px-1 py-0.5 rounded bg-risk-amber-bg border border-risk-amber-border text-risk-amber-text text-[9px] font-bold align-middle"
                  >
                    {segment.short}
                  </span>
                ) : (
                  <span key={index}>{segment.value}</span>
                ),
              )
            )}
          </div>
        ) : (
          <textarea
            rows={12}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck={false}
            className={`h-[16rem] sm:h-[19rem] w-full resize-none border-0 bg-transparent p-3.5 font-editor text-xs sm:text-[13px] leading-relaxed text-foreground placeholder:text-muted focus:outline-none ${
              readOnly ? 'bg-card-raised/40' : ''
            }`}
          />
        )}
      </div>
    </div>
  );
}
