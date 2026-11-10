import React, { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-[13px] text-foreground placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

const WIDE_TYPES = new Set(['textarea', 'keywords']);

function splitKeywords(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function KeywordInput({ field, value, onChange, disabled }) {
  const [draft, setDraft] = useState('');
  const [keywords, setKeywords] = useState(() => splitKeywords(value));

  useEffect(() => {
    setKeywords(splitKeywords(value));
  }, [value]);

  const commit = (raw) => {
    const incoming = splitKeywords(raw);
    if (!incoming.length) return;

    const next = [...keywords];
    incoming.forEach((keyword) => {
      if (!next.some((item) => item.toLowerCase() === keyword.toLowerCase())) {
        next.push(keyword);
      }
    });
    const limited = next.slice(0, 64);
    setKeywords(limited);
    onChange(limited.join(', '));
    setDraft('');
  };

  const remove = (keyword) => {
    const next = keywords.filter((item) => item !== keyword);
    setKeywords(next);
    onChange(next.join(', '));
  };

  return (
    <div className="space-y-2">
      <div
        className={`${INPUT_CLASS} flex flex-wrap items-center gap-1.5 min-h-[46px] ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand"
          >
            {keyword}
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(keyword)}
              className="rounded p-0.5 hover:bg-brand/10 disabled:pointer-events-none"
              aria-label={`Remove ${keyword}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          disabled={disabled}
          placeholder={keywords.length ? 'Add another…' : field.placeholder || 'Add keywords'}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit(draft);
            } else if (event.key === 'Backspace' && !draft && keywords.length) {
              remove(keywords[keywords.length - 1]);
            }
          }}
          onBlur={() => commit(draft)}
          className="flex-1 min-w-[8rem] bg-transparent border-0 p-0 text-[13px] text-foreground placeholder:text-muted/60 focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>{keywords.length}/64 keywords</span>
        <span>Press Enter or comma to add</span>
      </div>
    </div>
  );
}

export default function FieldControl({ field, value, onChange, disabled, format }) {
  const unsupported = Boolean(disabled);
  const bytes = new TextEncoder().encode(String(value ?? '')).length;
  const overLimit = field.maxBytes ? bytes > field.maxBytes : false;

  let control;

  if (field.type === 'textarea') {
    control = (
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        disabled={unsupported}
        className={`${INPUT_CLASS} resize-y min-h-[92px]`}
      />
    );
  } else if (field.type === 'keywords') {
    control = (
      <KeywordInput
        field={field}
        value={value}
        onChange={onChange}
        disabled={unsupported}
      />
    );
  } else if (field.type === 'select') {
    const options = field.options || [];
    const hasCurrent = options.some((option) => option.value === value);
    control = (
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={unsupported}
        className={INPUT_CLASS}
      >
        <option value="">Not set</option>
        {value && !hasCurrent && <option value={value}>{value}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    const inputType =
      field.type === 'datetime'
        ? 'datetime-local'
        : field.type === 'date'
          ? 'date'
          : field.type === 'number'
            ? 'number'
            : field.type === 'url'
              ? 'url'
              : field.type === 'email'
                ? 'email'
                : field.type === 'tel'
                  ? 'tel'
                  : 'text';

    control = (
      <input
        type={inputType}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        disabled={unsupported}
        min={field.min}
        max={field.max}
        step={field.step}
        inputMode={field.inputMode || (field.type === 'gps' ? 'decimal' : undefined)}
        className={INPUT_CLASS}
      />
    );
  }

  return (
    <div className={WIDE_TYPES.has(field.type) ? 'sm:col-span-2 space-y-1.5' : 'space-y-1.5'}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-strong">
          {field.label}
          {field.essential && (
            <span className="ml-1.5 rounded bg-brand-soft px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-brand align-middle">
              CORE
            </span>
          )}
        </label>
        {field.maxBytes && (
          <span
            className={`text-[10px] font-mono ${
              overLimit ? 'text-risk-rose-text font-bold' : 'text-muted'
            }`}
          >
            {bytes}/{field.maxBytes} B
          </span>
        )}
      </div>

      {control}

      {unsupported && (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-risk-amber-text">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          This field cannot be stored in {String(format || '').toUpperCase()}. It is saved
          for JPEG only.
        </p>
      )}

      {!unsupported && overLimit && (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-risk-amber-text">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          Over the {field.maxBytes}-byte limit. The writer will shorten this value.
        </p>
      )}

      {!unsupported && field.help && !overLimit && (
        <p className="text-[11px] leading-relaxed text-muted">{field.help}</p>
      )}
    </div>
  );
}
