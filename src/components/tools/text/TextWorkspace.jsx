import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  GitCompare,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_OPTIONS,
  MAX_TEXT_CHARS,
  PRESETS,
  reveal,
  sanitize,
} from '../../../utils/textSanitizer';
import { analyzePatterns } from '../../../utils/textPatterns';
import { diffTexts, hasChanges } from '../../../utils/textDiff';
import EditorPane from './EditorPane';
import DiffView from './DiffView';
import FindingsPanel from './FindingsPanel';
import OutputBar from './OutputBar';
import RulesPopover from './RulesPopover';

const PRESET_LIST = [PRESETS.light, PRESETS.standard, PRESETS.aggressive];

const SAMPLE_TEXT = `In today's fast-paced digital landscape, it is important to note that content teams face mounting pressure. Furthermore, organizations must leverage cutting-edge tools to remain competitive. Moreover, these solutions enable teams to streamline workflows. Additionally, robust platforms provide comprehensive capabilities. In conclusion, embracing these transformative technologies is crucial for success.\u200B

Many drafts also carry paste residue: non-breaking\u00A0spaces, soft\u00ADhyphens from PDF extraction, and typographic punctuation “like this.”`;

function formatCount(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

export default function TextWorkspace() {
  const [inputText, setInputText] = useState('');
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS });
  const [presetId, setPresetId] = useState('standard');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [revealSource, setRevealSource] = useState(false);
  const [showDiff, setShowDiff] = useState(true);
  const [tab, setTab] = useState('characters');
  const [selectedSample, setSelectedSample] = useState(null);

  const deferredInput = useDeferredValue(inputText);
  const tooLong = deferredInput.length > MAX_TEXT_CHARS;
  const hasInput = inputText.length > 0;

  const result = useMemo(() => {
    if (tooLong) return null;
    return sanitize(deferredInput, options);
  }, [deferredInput, options, tooLong]);

  const patterns = useMemo(() => {
    if (tooLong) return { available: false, words: 0, sentences: 0, signals: [] };
    return analyzePatterns(deferredInput);
  }, [deferredInput, tooLong]);

  const revealed = useMemo(() => {
    if (!revealSource || tooLong) return null;
    return reveal(deferredInput, options);
  }, [deferredInput, options, revealSource, tooLong]);

  const diff = useMemo(() => {
    if (!result || tooLong) return null;
    return diffTexts(deferredInput, result.text);
  }, [deferredInput, result, tooLong]);

  const choosePreset = (preset) => {
    setPresetId(preset.id);
    setOptions((prev) => ({ ...prev, ...preset.options }));
  };

  const changeRule = (key, value) => {
    setPresetId(null);
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setInputText('');
    setOptions({ ...DEFAULT_OPTIONS });
    setPresetId('standard');
    setRevealSource(false);
    setShowDiff(true);
    setTab('characters');
    setSelectedSample(null);
    setRulesOpen(false);
  };

  const output = result?.text || '';
  const isClean = Boolean(result) && hasInput && result.residual === 0;

  return (
    <div className="bg-white rounded-panel border border-subtle shadow-subtle overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-subtle">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-card-raised border border-subtle">
          {PRESET_LIST.map((preset) => {
            const active = presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset)}
                aria-pressed={active}
                title={preset.hint}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  active
                    ? 'bg-white text-brand shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          {!presetId && (
            <span className="px-2 py-1 text-[10px] font-mono text-muted">custom</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setRulesOpen((value) => !value)}
              aria-expanded={rulesOpen}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                rulesOpen
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-subtle text-muted hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Rules
              <ChevronDown
                className={`w-3 h-3 transition-transform ${rulesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <RulesPopover
              open={rulesOpen}
              onClose={() => setRulesOpen(false)}
              options={options}
              onChange={changeRule}
            />
          </div>

          {!hasInput && (
            <button
              type="button"
              onClick={() => setInputText(SAMPLE_TEXT)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted hover:text-brand transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sample
            </button>
          )}

          {hasInput && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted hover:text-risk-rose-text transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {tooLong && (
        <div className="flex items-start gap-2.5 border-b border-risk-amber-border bg-risk-amber-bg px-4 py-2.5 text-[11px] text-risk-amber-text">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            That paste is {formatCount(deferredInput.length)} characters — over the{' '}
            {formatCount(MAX_TEXT_CHARS)} limit. Trim it to keep cleaning responsive.
          </span>
        </div>
      )}

      {/* ── Editors ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-subtle">
        <EditorPane
          label="Source"
          meta={
            hasInput && result
              ? `${formatCount(result.stats.before.words)} words · ${formatCount(
                  result.stats.before.chars,
                )} chars`
              : ''
          }
          actions={
            <button
              type="button"
              onClick={() => setRevealSource((value) => !value)}
              disabled={!hasInput}
              aria-pressed={revealSource}
              title="Show every invisible character as a label"
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                revealSource
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-subtle text-muted hover:text-foreground'
              } ${!hasInput ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {revealSource ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {revealSource ? 'Edit' : 'Reveal'}
            </button>
          }
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder="Paste a draft. Invisible characters, paste residue, AI tags and writing patterns are checked locally."
          revealed={revealed}
          emptyHint="Paste text to reveal its hidden characters."
        />

        <div className="flex min-h-0 flex-col">
          {/* Cleaned pane header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-subtle bg-card-raised/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              Cleaned
            </span>
            <div className="flex items-center gap-2">
              {hasInput && result && (
                <span className="font-mono text-[10px] text-muted">
                  {formatCount(result.stats.after.words)} words · {formatCount(result.stats.after.chars)} chars
                </span>
              )}

              {/* Diff / Plain toggle */}
              {hasInput && result && (
                <button
                  type="button"
                  onClick={() => setShowDiff((v) => !v)}
                  aria-pressed={showDiff}
                  title={showDiff ? 'Switch to plain text' : 'Show what changed'}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                    showDiff
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-subtle text-muted hover:text-foreground'
                  }`}
                >
                  <GitCompare className="w-3 h-3" />
                  {showDiff ? 'Diff' : 'Plain'}
                </button>
              )}

              {/* Clean / residual badge */}
              {hasInput && result ? (
                isClean ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-risk-emerald-bg border border-risk-emerald-border text-risk-emerald-text font-mono text-[9px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    clean
                  </span>
                ) : result.residual > 0 ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-risk-amber-bg border border-risk-amber-border text-risk-amber-text font-mono text-[9px] font-bold">
                    <AlertTriangle className="w-3 h-3" />
                    {formatCount(result.residual)} left
                  </span>
                ) : null
              ) : null}
            </div>
          </div>

          {/* Diff legend — only when diff is visible and there are actual changes */}
          {hasInput && result && showDiff && diff && hasChanges(diff) && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-1.5 border-b border-subtle bg-card-raised/40 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
                <span className="text-muted">removed</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" />
                <span className="text-muted">inserted</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" />
                <span className="text-muted">changed</span>
              </span>
            </div>
          )}

          {/* Diff or plain text */}
          {hasInput && result && showDiff && diff ? (
            <DiffView
              ops={diff}
              placeholder="Cleaned text appears here as you type."
            />
          ) : (
            <textarea
              readOnly
              rows={12}
              value={output}
              placeholder="Cleaned text appears here as you type."
              spellCheck={false}
              className="h-[16rem] sm:h-[19rem] w-full resize-none border-0 bg-transparent p-3.5 font-editor text-xs sm:text-[13px] leading-relaxed text-foreground placeholder:text-muted focus:outline-none bg-card-raised/40"
            />
          )}
        </div>
      </div>

      {hasInput && result && (
        <FindingsPanel
          result={result}
          patterns={patterns}
          tab={tab}
          onTab={setTab}
          selectedSample={selectedSample}
          onSelectSample={setSelectedSample}
        />
      )}

      <OutputBar
        result={result}
        input={deferredInput}
        output={output}
        patterns={patterns}
        options={options}
        hasInput={hasInput}
      />
    </div>
  );
}
