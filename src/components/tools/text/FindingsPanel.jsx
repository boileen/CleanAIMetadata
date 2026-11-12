import React from 'react';
import { CheckCircle2, ScanLine, TextCursorInput, ShieldAlert } from 'lucide-react';

function actionTone(action) {
  if (action === 'removed' || action === 'normalized') {
    return 'border-risk-emerald-border bg-risk-emerald-bg text-risk-emerald-text';
  }
  if (action === 'kept (emoji)' || action === 'kept (layout)' || action === 'kept') {
    return 'border-subtle bg-card-strong text-muted';
  }
  return 'border-risk-amber-border bg-risk-amber-bg text-risk-amber-text';
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
        active
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-transparent text-muted hover:text-foreground'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

function CharacterRows({ result }) {
  if (!result) return null;

  if (!result.findings.length) {
    return (
      <div className="flex items-center gap-2.5 px-5 py-4 text-xs text-muted">
        <CheckCircle2 className="w-4 h-4 text-risk-emerald-text" />
        No tracked characters found. This text is already plain.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-subtle">
      {result.payloads.map((payload, index) => (
        <li
          key={`payload-${index}`}
          className="flex flex-wrap items-start gap-x-3 gap-y-1 px-4 sm:px-5 py-2.5 bg-risk-amber-bg/40"
        >
          <span className="font-mono text-[10px] font-bold text-risk-amber-text shrink-0">
            HIDDEN
          </span>
          <span className="text-[11px] text-foreground flex-1 min-w-[12rem]">
            <ShieldAlert className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-risk-amber-text" />
            Decoded instruction: <span className="font-editor">“{payload.text}”</span>
          </span>
          <span className="font-mono text-[10px] text-muted">
            {payload.chars} tag characters
          </span>
        </li>
      ))}

      {result.findings.map((finding) => (
        <li
          key={finding.code}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 px-4 sm:px-5 py-2.5"
        >
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-brand whitespace-nowrap">
            {finding.code}
          </span>
          <span className="min-w-0 text-[11px] text-muted-strong">
            <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-card-strong border border-subtle text-foreground mr-1.5">
              {finding.short}
            </span>
            <span className="align-middle">{finding.name}</span>
          </span>
          <span className="flex items-center gap-2 justify-end">
            <span className="font-mono text-[11px] text-foreground">×{finding.count}</span>
            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[9px] font-semibold ${actionTone(
                finding.action,
              )}`}
            >
              {finding.action}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function PatternRows({ patterns, selected, onSelect }) {
  if (!patterns.available) {
    return (
      <div className="px-5 py-4 text-xs text-muted">
        {patterns.reason || 'Paste at least a few paragraphs to read writing patterns.'}
      </div>
    );
  }

  if (!patterns.signals.length) {
    return (
      <div className="flex items-center gap-2.5 px-5 py-4 text-xs text-muted">
        <CheckCircle2 className="w-4 h-4 text-risk-emerald-text" />
        No repeated patterns found in {patterns.sentences} sentences. Variation and phrasing look
        organic.
      </div>
    );
  }

  return (
    <div>
      {selected && (
        <div className="px-4 sm:px-5 py-2.5 border-b border-subtle bg-brand-soft/50">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-brand mb-1">
            Focused sentence
          </span>
          <p className="text-[11px] leading-relaxed text-foreground">
            <mark className="bg-risk-amber-bg text-foreground px-0.5 rounded">{selected}</mark>
          </p>
        </div>
      )}

      <ul className="divide-y divide-subtle">
        {patterns.signals.map((signal) => (
          <li key={signal.id} className="px-4 sm:px-5 py-3 space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-foreground">{signal.label}</span>
              <span className="font-mono text-[10px] text-muted shrink-0">×{signal.count}</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">{signal.summary}</p>

            {signal.samples.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {signal.samples.map((sample, index) => (
                  <button
                    key={`${signal.id}-${index}`}
                    type="button"
                    onClick={() => onSelect(selected === sample.text ? null : sample.text)}
                    className="max-w-full text-left font-editor text-[10px] leading-snug text-muted-strong bg-card-raised border border-subtle rounded-lg px-2 py-1 hover:border-brand/40 hover:text-foreground transition-colors"
                  >
                    {sample.text}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className="px-4 sm:px-5 py-2 text-[10px] text-muted border-t border-subtle">
        Counts quote your own sentences. They do not score likelihood and never change a word.
      </p>
    </div>
  );
}

export default function FindingsPanel({
  result,
  patterns,
  tab,
  onTab,
  selectedSample,
  onSelectSample,
}) {
  const patternCount = patterns?.signals.length || 0;

  return (
    <div className="border-t border-subtle">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2">
        <div className="flex items-center gap-1">
          <TabButton
            active={tab === 'characters'}
            onClick={() => onTab('characters')}
            icon={ScanLine}
          >
            Characters
            {result ? <span className="font-mono text-[10px] text-muted">{result.total}</span> : null}
          </TabButton>
          <TabButton
            active={tab === 'patterns'}
            onClick={() => onTab('patterns')}
            icon={TextCursorInput}
          >
            Patterns
            <span className="font-mono text-[10px] text-muted">{patternCount}</span>
          </TabButton>
        </div>

        {tab === 'characters' && result && (
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted">
            <span>{result.counts.invisible} invisible</span>
            <span className="text-subtle">·</span>
            <span>{result.counts.space} spaces</span>
            <span className="text-subtle">·</span>
            <span>{result.counts.ai} AI</span>
          </div>
        )}
      </div>

      <div className="max-h-[18rem] overflow-y-auto">
        {tab === 'characters' ? (
          <CharacterRows result={result} />
        ) : (
          <PatternRows patterns={patterns} selected={selectedSample} onSelect={onSelectSample} />
        )}
      </div>
    </div>
  );
}
