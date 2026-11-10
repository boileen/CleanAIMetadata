import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';

const SAMPLE_AI_TEXT = `In today's fast-paced digital ecosystem, artificial intelligence has fundamentally revolutionized how content is generated—from complex algorithmic models to conversational agents like ChatGPT and Claude. 

However, many language models unknowingly embed invisible zero-width spaces (such as U+200B and U+FEFF) and non-breaking spaces into outputs. Furthermore, characteristic punctuation patterns—including frequent em-dashes and typographic curly quotes—serve as telltale markers for automated detectors.`;

export default function TextSanitizer() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Sanitization Rule Toggles
  const [rules, setRules] = useState({
    stripZeroWidth: true,       // U+200B, U+200C, U+200D, U+2060, U+FEFF
    normalizeNBSP: true,        // U+00A0, U+202F -> standard space
    replaceEmDashes: true,      // — -> -
    straightenQuotes: true,     // “ ” ‘ ’ -> " '
    removeTrailingSpaces: true, // Trim extra spaces per line
  });

  const toggleRule = (key) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Detection Analysis on Input Text
  const detectionStats = useMemo(() => {
    if (!inputText) {
      return { zeroWidthCount: 0, nbspCount: 0, emDashCount: 0, curlyQuotesCount: 0, totalIssues: 0 };
    }

    const zeroWidthRegex = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
    const nbspRegex = /[\u00A0\u202F]/g;
    const emDashRegex = /—/g;
    const curlyQuotesRegex = /[“”‘’]/g;

    const zeroWidthCount = (inputText.match(zeroWidthRegex) || []).length;
    const nbspCount = (inputText.match(nbspRegex) || []).length;
    const emDashCount = (inputText.match(emDashRegex) || []).length;
    const curlyQuotesCount = (inputText.match(curlyQuotesRegex) || []).length;

    return {
      zeroWidthCount,
      nbspCount,
      emDashCount,
      curlyQuotesCount,
      totalIssues: zeroWidthCount + nbspCount + emDashCount + curlyQuotesCount,
    };
  }, [inputText]);

  // Real-Time Sanitized Output
  const sanitizedOutput = useMemo(() => {
    if (!inputText) return '';
    let result = inputText;

    // 1. Strip Zero-Width Characters
    if (rules.stripZeroWidth) {
      result = result.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '');
    }

    // 2. Normalize Non-Breaking Spaces
    if (rules.normalizeNBSP) {
      result = result.replace(/[\u00A0\u202F]/g, ' ');
    }

    // 3. Replace Em-Dashes
    if (rules.replaceEmDashes) {
      result = result.replace(/—/g, ' - ');
      result = result.replace(/\s+-\s+/g, ' - '); // clean double spaces around dash
    }

    // 4. Straighten Curly Quotes
    if (rules.straightenQuotes) {
      result = result
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'");
    }

    // 5. Remove Trailing Spaces
    if (rules.removeTrailingSpaces) {
      result = result
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n');
    }

    return result;
  }, [inputText, rules]);

  // Word & Character count helpers
  const getStats = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
  };

  const inputStats = getStats(inputText);
  const outputStats = getStats(sanitizedOutput);

  const handleCopyClean = () => {
    if (!sanitizedOutput) return;
    navigator.clipboard.writeText(sanitizedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!sanitizedOutput) return;
    const blob = new Blob([sanitizedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleaned_ai_text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSample = () => {
    // Injects sample text with real zero-width spaces (\u200B), non-breaking spaces (\u00A0), and em-dashes
    const sampleWithWatermarks = `In today's fast-paced\u200B digital ecosystem\u200B, artificial intelligence\u00A0has revolutionized writing—from conversational\uFEFF chatbots to large language models. 

However, many AI tools embed invisible zero-width watermarks (like U+200B) and non-breaking spaces\u00A0directly into your text. Notice how “curly quotes” and em-dashes—like this one—are telltale signs of AI generation.`;
    setInputText(sampleWithWatermarks);
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Card: Rule Toggles & Action Controls */}
      <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-subtle/50">
          <Sparkles className="w-4 h-4 text-brand" />
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider font-mono">
            Sanitization Rules &amp; Heuristics
          </h3>
        </div>

        {/* Checkbox Rule Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card-raised border border-subtle cursor-pointer hover:bg-card-strong/60 transition-colors">
            <input
              type="checkbox"
              checked={rules.stripZeroWidth}
              onChange={() => toggleRule('stripZeroWidth')}
              className="w-4 h-4 rounded text-brand focus:ring-brand"
            />
            <span className="font-medium text-foreground">
              Strip Zero-Width Chars <span className="text-[10px] text-muted block font-mono">U+200B, U+FEFF, U+2060</span>
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card-raised border border-subtle cursor-pointer hover:bg-card-strong/60 transition-colors">
            <input
              type="checkbox"
              checked={rules.normalizeNBSP}
              onChange={() => toggleRule('normalizeNBSP')}
              className="w-4 h-4 rounded text-brand focus:ring-brand"
            />
            <span className="font-medium text-foreground">
              Normalize Spaces <span className="text-[10px] text-muted block font-mono">U+00A0 Non-Breaking Space</span>
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card-raised border border-subtle cursor-pointer hover:bg-card-strong/60 transition-colors">
            <input
              type="checkbox"
              checked={rules.replaceEmDashes}
              onChange={() => toggleRule('replaceEmDashes')}
              className="w-4 h-4 rounded text-brand focus:ring-brand"
            />
            <span className="font-medium text-foreground">
              Replace AI Em-Dashes <span className="text-[10px] text-muted block font-mono">— converted to standard -</span>
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card-raised border border-subtle cursor-pointer hover:bg-card-strong/60 transition-colors">
            <input
              type="checkbox"
              checked={rules.straightenQuotes}
              onChange={() => toggleRule('straightenQuotes')}
              className="w-4 h-4 rounded text-brand focus:ring-brand"
            />
            <span className="font-medium text-foreground">
              Convert Curly Quotes <span className="text-[10px] text-muted block font-mono">“ ” ‘ ’ to straight " '</span>
            </span>
          </label>
        </div>
      </div>

      {/* Dual-Pane Side-by-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT PANE: Raw Input Area */}
        <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-subtle/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Original AI Text</span>
              <span className="text-[11px] font-mono text-muted">
                ({inputStats.words} words · {inputStats.chars} chars)
              </span>
            </div>

            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-xs text-muted hover:text-risk-rose-text flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Textarea */}
          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text from ChatGPT, Claude, Gemini, or any LLM here to inspect and remove hidden watermarks..."
            className="w-full p-3.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand transition-colors font-sans leading-relaxed resize-none"
          />

          {/* Live Footprint Counters Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
            {detectionStats.totalIssues > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-risk-rose-bg text-risk-rose-text border border-risk-rose-border font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {detectionStats.totalIssues} Markers Detected
                </span>
                {detectionStats.zeroWidthCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-card-strong text-muted-strong border border-subtle">
                    {detectionStats.zeroWidthCount} Zero-Width Chars
                  </span>
                )}
                {detectionStats.nbspCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-card-strong text-muted-strong border border-subtle">
                    {detectionStats.nbspCount} NBSP Spaces
                  </span>
                )}
                {detectionStats.emDashCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-card-strong text-muted-strong border border-subtle">
                    {detectionStats.emDashCount} Em-Dashes
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted">
                {inputText ? '✓ No hidden characters detected in raw text' : 'Waiting for input...'}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Sanitized Output Area */}
        <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-subtle/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Sanitized Clean Text</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft text-brand font-mono text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-brand" />
                0 Footprints
              </span>
            </div>

            <span className="text-[11px] font-mono text-muted">
              ({outputStats.words} words · {outputStats.chars} chars)
            </span>
          </div>

          {/* Textarea */}
          <textarea
            readOnly
            rows={12}
            value={sanitizedOutput}
            placeholder="Sanitized, natural human-like text will appear here automatically with zero hidden tokens..."
            className="w-full p-3.5 rounded-xl bg-card-raised/50 border border-subtle text-xs sm:text-sm text-foreground font-sans leading-relaxed resize-none focus:outline-none select-all"
          />

          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-mono text-muted">
              100% In-Browser Sanitization
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!sanitizedOutput}
                onClick={handleDownloadTxt}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-subtle transition-all ${
                  sanitizedOutput 
                    ? 'bg-white hover:bg-card-strong text-foreground cursor-pointer shadow-subtle' 
                    : 'bg-card-raised text-muted/50 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .TXT</span>
              </button>

              <button
                type="button"
                disabled={!sanitizedOutput}
                onClick={handleCopyClean}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  sanitizedOutput 
                    ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer hover:-translate-y-0.5' 
                    : 'bg-card-strong text-muted/50 cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-soft" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Clean Text</span>
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
