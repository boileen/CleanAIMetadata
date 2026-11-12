import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DEFAULT_OPTIONS,
  MAX_TEXT_CHARS,
  PRESETS,
  reveal,
  sanitize,
} from '../../utils/textSanitizer';

const PRESET_LIST = [PRESETS.light, PRESETS.standard, PRESETS.aggressive];

const SAMPLE_TEXT = `In today’s fast-paced digital ecosystem, artificial intelligence has fundamentally revolutionized how content is generated—from conversational chatbots to large language models.\u200B

However, many pasted drafts carry invisible residue: zero-width spaces\u200B, non-breaking\u00A0spaces, soft\u00ADhyphens from PDF extraction, and typographic punctuation “like this.”`;

function formatCount(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function copyFallback(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

export default function TextSanitizer() {
  const [inputText, setInputText] = useState('');
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS });
  const [presetId, setPresetId] = useState('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);

  const deferredInput = useDeferredValue(inputText);
  const tooLong = deferredInput.length > MAX_TEXT_CHARS;

  const result = useMemo(() => {
    if (tooLong) return null;
    return sanitize(deferredInput, options);
  }, [deferredInput, options, tooLong]);

  const revealed = useMemo(() => {
    if (!showReveal || tooLong) return [];
    return reveal(deferredInput, options);
  }, [deferredInput, options, showReveal, tooLong]);

  const choosePreset = (preset) => {
    setPresetId(preset.id);
    setOptions((prev) => ({ ...prev, ...preset.options }));
  };

  const toggle = (key) => setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  const output = result?.text || '';
  const keptInEmoji = result
    ? result.findings
        .filter((finding) => finding.group === 'invisible' && finding.action === 'kept (emoji)')
        .reduce((sum, finding) => sum + finding.count, 0)
    : 0;
  const removedHidden = result ? result.hidden - keptInEmoji : 0;
  const hasInput = inputText.length > 0;
  const isClean = Boolean(result) && hasInput && result.residual === 0;

  const handleCopy = async () => {
    if (!output) return;
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      if (copyFallback(output)) {
        setCopied(true);
      } else {
        setCopyError('Clipboard access was blocked by the browser. Select the text and copy it manually.');
      }
    }
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleaned-text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setInputText('');
    setCopied(false);
    setCopyError(null);
    setShowReveal(false);
    setOptions({ ...DEFAULT_OPTIONS });
    setPresetId('standard');
  };

  return (
    <div className="space-y-6">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-subtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h3 className="font-mono text-xs sm:text-[13px] font-bold text-foreground uppercase tracking-wider">
              Cleaning profile
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            aria-expanded={showAdvanced}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-strong hover:text-brand transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Rules</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_LIST.map((preset) => {
            const active = presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset)}
                aria-pressed={active}
                className={`text-left px-3.5 py-3 rounded-xl border transition-all ${
                  active
                    ? 'border-brand bg-brand-soft shadow-sm'
                    : 'border-subtle bg-card-raised hover:border-subtle-hover'
                }`}
              >
                <span className={`block text-[13px] font-bold ${active ? 'text-brand' : 'text-foreground'}`}>
                  {preset.label}
                </span>
                <span className="block text-[11px] text-muted leading-snug mt-0.5">{preset.hint}</span>
              </button>
            );
          })}
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={options.normalizePunctuation}
                onChange={() => toggle('normalizePunctuation')}
                className="mt-0.5 w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>
                Straighten quotes and dashes
                <span className="block text-[10px] font-mono text-muted">“ ” → &quot; · — → - · … → ...</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={options.normalizeSpaces}
                onChange={() => toggle('normalizeSpaces')}
                className="mt-0.5 w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>
                Normalise spaces
                <span className="block text-[10px] font-mono text-muted">NBSP, thin spaces, double spaces</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={options.foldLetters}
                onChange={() => toggle('foldLetters')}
                className="mt-0.5 w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>
                Fold lookalike letters
                <span className="block text-[10px] font-mono text-muted">Cyrillic / Greek only inside Latin words</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={options.stripBidi}
                onChange={() => toggle('stripBidi')}
                className="mt-0.5 w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>
                Strip bidi overrides
                <span className="block text-[10px] font-mono text-muted">Trojan-source controls · affects RTL text</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={options.preserveMarkdown}
                onChange={() => toggle('preserveMarkdown')}
                className="mt-0.5 w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>
                Protect code and URLs
                <span className="block text-[10px] font-mono text-muted">Fenced blocks, inline code, links stay byte-identical</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={options.preserveEmoji}
                onChange={() => toggle('preserveEmoji')}
                className="mt-0.5 w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span>
                Preserve emoji sequences
                <span className="block text-[10px] font-mono text-muted">Keeps ZWJ and tag characters inside glyphs</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground sm:col-span-2">
              <span className="mt-0.5 text-muted">Dash style</span>
              <select
                value={options.dashStyle}
                onChange={(event) => setOptions((prev) => ({ ...prev, dashStyle: event.target.value }))}
                className="ml-auto w-40 px-2.5 py-1.5 rounded-lg border border-subtle bg-card-raised text-xs text-foreground focus:outline-none focus:border-brand"
              >
                <option value="hyphen">Spaced hyphen ( - )</option>
                <option value="comma">Comma (, )</option>
                <option value="keep">Keep dashes</option>
              </select>
            </label>
          </div>
        )}

        {tooLong && (
          <div className="flex items-start gap-2.5 rounded-xl border border-risk-amber-border bg-risk-amber-bg px-4 py-3 text-xs text-risk-amber-text">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              That paste is {formatCount(deferredInput.length)} characters — over the{' '}
              {formatCount(MAX_TEXT_CHARS)} limit. Trim it to keep cleaning responsive.
            </span>
          </div>
        )}
      </div>

      {/* ── Findings ─────────────────────────────────────────────── */}
      {result && hasInput && (
        <div className="bg-white rounded-panel border border-subtle shadow-subtle overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-subtle">
            <h3 className="font-mono text-xs sm:text-[13px] font-bold text-foreground uppercase tracking-wider">
              Scan results
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-subtle bg-card-strong text-muted-strong">
                {formatCount(result.counts.invisible)} invisible
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-subtle bg-card-strong text-muted-strong">
                {formatCount(result.counts.space)} spaces
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-subtle bg-card-strong text-muted-strong">
                {formatCount(result.counts.punctuation)} typographic
              </span>
            </div>
          </div>

          {result.findings.length === 0 ? (
            <div className="flex items-center gap-2.5 px-5 sm:px-6 py-4 text-xs text-muted">
              <CheckCircle2 className="w-4 h-4 text-risk-emerald-text" />
              No tracked characters found. This text is already plain.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] sm:text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted border-b border-subtle">
                    <th className="px-5 sm:px-6 py-2.5 font-semibold">Code</th>
                    <th className="px-3 py-2.5 font-semibold">Name</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Count</th>
                    <th className="px-5 sm:px-6 py-2.5 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {result.findings.slice(0, 12).map((finding) => (
                    <tr key={finding.code} className="hover:bg-card-raised/60">
                      <td className="px-5 sm:px-6 py-2.5 font-mono text-brand whitespace-nowrap">
                        {finding.code}
                      </td>
                      <td className="px-3 py-2.5 text-muted-strong">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-card-strong border border-subtle mr-2 text-foreground">
                          {finding.short}
                        </span>
                        <span className="whitespace-nowrap">{finding.name}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-right">{formatCount(finding.count)}</td>
                      <td className="px-5 sm:px-6 py-2.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                            finding.action === 'removed' || finding.action === 'normalized'
                              ? 'border-risk-emerald-border bg-risk-emerald-bg text-risk-emerald-text'
                              : finding.action === 'kept (emoji)'
                                ? 'border-subtle bg-card-strong text-muted'
                                : 'border-risk-amber-border bg-risk-amber-bg text-risk-amber-text'
                          }`}
                        >
                          {finding.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.findings.length > 12 && (
                <p className="px-5 sm:px-6 py-2.5 text-[11px] text-muted border-t border-subtle">
                  +{result.findings.length - 12} more character types
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Editors ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input */}
        <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-subtle">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Original text</span>
              <span className="text-[11px] font-mono text-muted">
                {formatCount(result?.stats.before.words ?? 0)} words · {formatCount(result?.stats.before.chars ?? 0)} chars
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowReveal((value) => !value)}
                disabled={!hasInput}
                aria-pressed={showReveal}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  showReveal
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-subtle text-muted hover:text-foreground'
                } ${!hasInput ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {showReveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showReveal ? 'Edit' : 'Reveal'}</span>
              </button>

              {hasInput && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-muted hover:text-risk-rose-text transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {showReveal ? (
            <div className="h-[19.5rem] overflow-auto rounded-xl bg-card-raised border border-subtle p-3.5">
              <pre className="whitespace-pre-wrap break-words font-editor text-[12px] leading-relaxed text-foreground">
                {revealed.map((segment, index) =>
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
                )}
                {!hasInput && <span className="text-muted">Paste text to reveal its hidden characters.</span>}
              </pre>
            </div>
          ) : (
            <textarea
              rows={12}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Paste text from ChatGPT, Google Docs, a PDF, or a website. Invisible characters and curly punctuation are detected and cleaned locally."
              className="w-full p-3.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand transition-colors font-editor leading-relaxed resize-none"
              spellCheck={false}
            />
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!hasInput ? (
              <button
                type="button"
                onClick={() => setInputText(SAMPLE_TEXT)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-subtle text-[11px] font-semibold text-muted-strong hover:text-brand hover:border-brand/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load sample text
              </button>
            ) : (
              <span className="text-[11px] font-mono text-muted">
                {removedHidden > 0
                  ? `${formatCount(removedHidden)} invisible characters will be removed`
                  : 'No invisible characters left to remove'}
                {keptInEmoji > 0 && ` · ${formatCount(keptInEmoji)} kept inside emoji`}
              </span>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-subtle">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Cleaned text</span>
              {isClean && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-emerald-bg border border-risk-emerald-border text-risk-emerald-text font-mono text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  clean
                </span>
              )}
              {result && hasInput && result.residual > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-amber-bg border border-risk-amber-border text-risk-amber-text font-mono text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {formatCount(result.residual)} left
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-muted">
              {formatCount(result?.stats.after.words ?? 0)} words · {formatCount(result?.stats.after.chars ?? 0)} chars
            </span>
          </div>

          <textarea
            readOnly
            rows={12}
            value={output}
            placeholder="Cleaned text appears here as you type."
            className="w-full p-3.5 rounded-xl bg-card-raised/60 border border-subtle text-xs sm:text-sm text-foreground font-editor leading-relaxed resize-none focus:outline-none"
            spellCheck={false}
          />

          {copyError && (
            <p className="text-[11px] text-risk-rose-text">{copyError}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-mono text-muted">
              {result && hasInput
                ? `${formatCount(result.stats.before.bytes)} → ${formatCount(result.stats.after.bytes)} bytes`
                : '100% in-browser · nothing uploaded'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!output}
                onClick={handleDownload}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-subtle transition-all ${
                  output
                    ? 'bg-white hover:bg-card-strong text-foreground shadow-subtle'
                    : 'bg-card-raised text-muted/50 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>.txt</span>
              </button>

              <button
                type="button"
                disabled={!output}
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  output
                    ? 'bg-brand hover:bg-brand-hover text-white hover:-translate-y-0.5'
                    : 'bg-card-strong text-muted/50 cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
