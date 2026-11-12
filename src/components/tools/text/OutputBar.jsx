import React, { useState } from 'react';
import { Check, Copy, Download, FileJson, AlertCircle } from 'lucide-react';
import { UNICODE_VERSION } from '../../../utils/textSanitizer';

function formatCount(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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

export default function OutputBar({ result, input, output, patterns, options, hasInput }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const before = result?.stats.before;
  const after = result?.stats.after;
  const delta = before && after ? before.bytes - after.bytes : 0;

  const handleCopy = async () => {
    if (!output) return;
    setError(null);
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      if (copyFallback(output)) {
        setCopied(true);
      } else {
        setError('Clipboard blocked. Select the text and copy it manually.');
      }
    }
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = () => {
    if (!result) return;
    const report = {
      tool: 'AI Text Cleaner',
      version: 2,
      unicodeVersion: UNICODE_VERSION,
      options,
      changed: output !== input,
      stats: { before, after, bytesRemoved: delta },
      findings: result.findings.map((finding) => ({
        code: finding.code,
        name: finding.name,
        count: finding.count,
        action: finding.action,
      })),
      patterns: patterns?.available
        ? patterns.signals.map((signal) => ({
            id: signal.id,
            label: signal.label,
            count: signal.count,
            summary: signal.summary,
          }))
        : [],
      hiddenPayloads: result.payloads.map((payload) => payload.text),
    };
    download('ai-text-report.json', JSON.stringify(report, null, 2), 'application/json');
  };

  return (
    <div className="border-t border-subtle px-4 sm:px-5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] sm:text-[11px] text-muted">
          {hasInput && result ? (
            <>
              <span className="text-foreground">{formatCount(after.bytes)}</span> bytes
              {delta > 0 && <span className="text-risk-emerald-text"> (−{formatCount(delta)})</span>}
              <span className="mx-1.5 text-subtle">·</span>
              {formatCount(after.words)} words
            </>
          ) : (
            '100% in-browser · nothing uploaded'
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!result}
            onClick={handleReport}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-subtle transition-colors ${
              result
                ? 'bg-white hover:bg-card-strong text-foreground'
                : 'bg-card-raised text-muted/50 cursor-not-allowed'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            Report
          </button>

          <button
            type="button"
            disabled={!output}
            onClick={() =>
              download('cleaned-text.txt', output, 'text/plain;charset=utf-8')
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-subtle transition-colors ${
              output
                ? 'bg-white hover:bg-card-strong text-foreground'
                : 'bg-card-raised text-muted/50 cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            .txt
          </button>

          <button
            type="button"
            disabled={!output}
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              output
                ? 'bg-brand hover:bg-brand-hover text-white shadow-sm'
                : 'bg-card-strong text-muted/50 cursor-not-allowed'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 mt-2 text-[10px] text-risk-rose-text">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
