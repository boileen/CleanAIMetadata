/**
 * Deterministic text sanitizer.
 *
 * Removes invisible Unicode artifacts, normalises whitespace, and repairs
 * typographic punctuation. Pure string functions with no DOM or React
 * dependency, so the same code runs in the browser and in `node --test`.
 *
 * Two rules govern the design:
 *  1. Never touch emoji sequences. U+200D, variation selectors, and tag
 *     characters are load-bearing inside glyphs like 👨‍👩‍👧 or 🏴󠁧󠁢󠁳󠁣󠁴󠁿.
 *  2. Never touch code or URLs when "preserve markdown" is on, so pasting a
 *     README through the tool does not break it.
 */

import { CONFUSABLES } from '../data/confusables.js';

/* ────────────────────────── character tables ────────────────────────── */

const INFO = new Map();

function define(cps, info) {
  for (const cp of cps) INFO.set(cp, info);
}

const range = (from, to) => {
  const out = [];
  for (let cp = from; cp <= to; cp += 1) out.push(cp);
  return out;
};

/* Invisible & format characters */
define([0x200b], { name: 'ZERO WIDTH SPACE', short: 'ZWSP', group: 'invisible', rule: 'zeroWidth' });
define([0x200c], { name: 'ZERO WIDTH NON-JOINER', short: 'ZWNJ', group: 'invisible', rule: 'zeroWidth' });
define([0x200d], { name: 'ZERO WIDTH JOINER', short: 'ZWJ', group: 'invisible', rule: 'zeroWidth' });
define([0x2060], { name: 'WORD JOINER', short: 'WJ', group: 'invisible', rule: 'zeroWidth' });
define([0xfeff], { name: 'ZERO WIDTH NO-BREAK SPACE (BOM)', short: 'BOM', group: 'invisible', rule: 'zeroWidth' });
define([0x180e], { name: 'MONGOLIAN VOWEL SEPARATOR', short: 'MVS', group: 'invisible', rule: 'zeroWidth' });
define([0x00ad], { name: 'SOFT HYPHEN', short: 'SHY', group: 'invisible', rule: 'zeroWidth' });

define([0x200e], { name: 'LEFT-TO-RIGHT MARK', short: 'LRM', group: 'invisible', rule: 'bidi' });
define([0x200f], { name: 'RIGHT-TO-LEFT MARK', short: 'RLM', group: 'invisible', rule: 'bidi' });
define([0x202a], { name: 'LEFT-TO-RIGHT EMBEDDING', short: 'LRE', group: 'invisible', rule: 'bidi' });
define([0x202b], { name: 'RIGHT-TO-LEFT EMBEDDING', short: 'RLE', group: 'invisible', rule: 'bidi' });
define([0x202c], { name: 'POP DIRECTIONAL FORMATTING', short: 'PDF', group: 'invisible', rule: 'bidi' });
define([0x202d], { name: 'LEFT-TO-RIGHT OVERRIDE', short: 'LRO', group: 'invisible', rule: 'bidi' });
define([0x202e], { name: 'RIGHT-TO-LEFT OVERRIDE', short: 'RLO', group: 'invisible', rule: 'bidi' });
define([0x2066], { name: 'LEFT-TO-RIGHT ISOLATE', short: 'LRI', group: 'invisible', rule: 'bidi' });
define([0x2067], { name: 'RIGHT-TO-LEFT ISOLATE', short: 'RLI', group: 'invisible', rule: 'bidi' });
define([0x2068], { name: 'FIRST STRONG ISOLATE', short: 'FSI', group: 'invisible', rule: 'bidi' });
define([0x2069], { name: 'POP DIRECTIONAL ISOLATE', short: 'PDI', group: 'invisible', rule: 'bidi' });

define(range(0x00, 0x08).concat([0x0b, 0x0c], range(0x0e, 0x1f), [0x7f]), {
  name: 'CONTROL CHARACTER',
  short: 'CTRL',
  group: 'invisible',
  rule: 'zeroWidth',
});

define(range(0xfe00, 0xfe0f), {
  name: 'VARIATION SELECTOR',
  short: 'VS',
  group: 'invisible',
  rule: 'zeroWidth',
});
for (let cp = 0xfe00; cp <= 0xfe0f; cp += 1) {
  INFO.set(cp, {
    name: `VARIATION SELECTOR-${cp - 0xfe00 + 1}`,
    short: `VS${cp - 0xfe00 + 1}`,
    group: 'invisible',
    rule: 'zeroWidth',
  });
}

INFO.set(0xe0001, { name: 'LANGUAGE TAG', short: 'TAG', group: 'invisible', rule: 'zeroWidth' });
for (let cp = 0xe0020; cp <= 0xe007f; cp += 1) {
  INFO.set(cp, { name: 'TAG CHARACTER', short: 'TAG', group: 'invisible', rule: 'zeroWidth' });
}

/* Non-standard spaces */
const SPACE_INFO = { group: 'space', rule: 'space' };
define([0x00a0], { ...SPACE_INFO, name: 'NO-BREAK SPACE', short: 'NBSP' });
define([0x1680], { ...SPACE_INFO, name: 'OGHAM SPACE MARK', short: 'OGSP' });
define([0x2000], { ...SPACE_INFO, name: 'EN QUAD', short: 'QUAD' });
define([0x2001], { ...SPACE_INFO, name: 'EM QUAD', short: 'QUAD' });
define([0x2002], { ...SPACE_INFO, name: 'EN SPACE', short: 'ENSP' });
define([0x2003], { ...SPACE_INFO, name: 'EM SPACE', short: 'EMSP' });
define([0x2004], { ...SPACE_INFO, name: 'THREE-PER-EM SPACE', short: '3/EM' });
define([0x2005], { ...SPACE_INFO, name: 'FOUR-PER-EM SPACE', short: '4/EM' });
define([0x2006], { ...SPACE_INFO, name: 'SIX-PER-EM SPACE', short: '6/EM' });
define([0x2007], { ...SPACE_INFO, name: 'FIGURE SPACE', short: 'FIGSP' });
define([0x2008], { ...SPACE_INFO, name: 'PUNCTUATION SPACE', short: 'PUNSP' });
define([0x2009], { ...SPACE_INFO, name: 'THIN SPACE', short: 'THSP' });
define([0x200a], { ...SPACE_INFO, name: 'HAIR SPACE', short: 'HAIR' });
define([0x202f], { ...SPACE_INFO, name: 'NARROW NO-BREAK SPACE', short: 'NNBSP' });
define([0x205f], { ...SPACE_INFO, name: 'MEDIUM MATHEMATICAL SPACE', short: 'MMSP' });
define([0x3000], { ...SPACE_INFO, name: 'IDEOGRAPHIC SPACE', short: 'IDSP' });
define([0x2028], { ...SPACE_INFO, name: 'LINE SEPARATOR', short: 'LSEP' });
define([0x2029], { ...SPACE_INFO, name: 'PARAGRAPH SEPARATOR', short: 'PSEP' });

/* Typographic punctuation */
const QUOTE_INFO = { group: 'punctuation', rule: 'quote' };
define([0x2018], { ...QUOTE_INFO, name: 'LEFT SINGLE QUOTATION MARK', short: '‘' });
define([0x2019], { ...QUOTE_INFO, name: 'RIGHT SINGLE QUOTATION MARK', short: '’' });
define([0x201a], { ...QUOTE_INFO, name: 'SINGLE LOW-9 QUOTATION MARK', short: '‚' });
define([0x201b], { ...QUOTE_INFO, name: 'SINGLE HIGH-REVERSED-9 QUOTATION MARK', short: '‛' });
define([0x201c], { ...QUOTE_INFO, name: 'LEFT DOUBLE QUOTATION MARK', short: '“' });
define([0x201d], { ...QUOTE_INFO, name: 'RIGHT DOUBLE QUOTATION MARK', short: '”' });
define([0x201e], { ...QUOTE_INFO, name: 'DOUBLE LOW-9 QUOTATION MARK', short: '„' });
define([0x00ab], { ...QUOTE_INFO, name: 'LEFT-POINTING DOUBLE ANGLE QUOTATION MARK', short: '«' });
define([0x00bb], { ...QUOTE_INFO, name: 'RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK', short: '»' });

const DASH_INFO = { group: 'punctuation', rule: 'dash' };
define([0x2013], { ...DASH_INFO, name: 'EN DASH', short: '–' });
define([0x2014], { ...DASH_INFO, name: 'EM DASH', short: '—' });
define([0x2015], { ...DASH_INFO, name: 'HORIZONTAL BAR', short: '―' });
define([0x2212], { ...DASH_INFO, name: 'MINUS SIGN', short: '−' });
define([0x2010], { ...DASH_INFO, name: 'HYPHEN', short: '‐' });
define([0x2011], { ...DASH_INFO, name: 'NON-BREAKING HYPHEN', short: '‑' });

define([0x2026], { group: 'punctuation', rule: 'punct', name: 'HORIZONTAL ELLIPSIS', short: '…' });
define([0xff01], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH EXCLAMATION MARK', short: '！' });
define([0xff1f], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH QUESTION MARK', short: '？' });
define([0xff0c], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH COMMA', short: '，' });
define([0xff1b], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH SEMICOLON', short: '；' });
define([0xff1a], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH COLON', short: '：' });
define([0xff08], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH LEFT PARENTHESIS', short: '（' });
define([0xff09], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH RIGHT PARENTHESIS', short: '）' });
define([0xff02], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH QUOTATION MARK', short: '＂' });
define([0xff07], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH APOSTROPHE', short: '＇' });
define([0xff0e], { group: 'punctuation', rule: 'punct', name: 'FULLWIDTH FULL STOP', short: '．' });

/* ────────────────────────────── presets ─────────────────────────────── */

export const PRESETS = {
  light: {
    id: 'light',
    label: 'Light',
    hint: 'Invisible characters only',
    options: {
      stripZeroWidth: true,
      stripBidi: false,
      normalizeSpaces: false,
      normalizePunctuation: false,
      foldLetters: false,
    },
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    hint: 'Invisibles, spaces and typography',
    options: {
      stripZeroWidth: true,
      stripBidi: false,
      normalizeSpaces: true,
      normalizePunctuation: true,
      foldLetters: false,
    },
  },
  aggressive: {
    id: 'aggressive',
    label: 'Aggressive',
    hint: 'Adds lookalike letters and bidi controls',
    options: {
      stripZeroWidth: true,
      stripBidi: true,
      normalizeSpaces: true,
      normalizePunctuation: true,
      foldLetters: true,
    },
  },
};

export const DEFAULT_OPTIONS = {
  ...PRESETS.standard.options,
  dashStyle: 'hyphen',
  preserveMarkdown: true,
  preserveEmoji: true,
  collapseSpaces: true,
  trimLines: true,
};

export const MAX_TEXT_CHARS = 200_000;

/* ───────────────────────────── helpers ──────────────────────────────── */

const PICTO = /\p{Extended_Pictographic}/u;
const WORD = /[\p{L}\p{M}]+/gu;
const SPACE_RE = new RegExp(
  `[${[
    0x00a0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
    0x2007, 0x2008, 0x2009, 0x200a, 0x202f, 0x205f, 0x3000, 0x2028, 0x2029,
  ]
    .map((cp) => `\\u{${cp.toString(16)}}`)
    .join('')}]`,
  'gu',
);

let segmenter = null;
if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
  segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
}

function* graphemes(text) {
  if (segmenter) {
    for (const part of segmenter.segment(text)) yield part.segment;
    return;
  }
  yield* Array.from(text);
}

const isEmojiCluster = (segment, preserveEmoji) =>
  preserveEmoji && segment.length > 1 && PICTO.test(segment);

const CODE_POINT = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

function isControl(cp) {
  return (
    cp <= 0x08 ||
    cp === 0x0b ||
    cp === 0x0c ||
    (cp >= 0x0e && cp <= 0x1f) ||
    cp === 0x7f
  );
}

function shouldRemove(cp, opts) {
  if (cp === 0x0a || cp === 0x09 || cp === 0x0d) return false;
  const info = INFO.get(cp);
  if (!info || info.group !== 'invisible') return false;
  if (info.rule === 'bidi') return Boolean(opts.stripBidi);
  return Boolean(opts.stripZeroWidth);
}

/* ──────────────────────── protected segments ────────────────────────── */

const INLINE_CODE = /`[^`\n]+`/g;
const URL_RE = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function fencedRanges(text) {
  const ranges = [];
  let offset = 0;
  let open = -1;

  for (const line of text.split('\n')) {
    const trimmed = line.trimStart();
    const isFence = trimmed.startsWith('```') || trimmed.startsWith('~~~');
    if (isFence) {
      if (open === -1) open = offset;
      else {
        ranges.push([open, offset + line.length]);
        open = -1;
      }
    }
    offset += line.length + 1;
  }

  if (open !== -1) ranges.push([open, text.length]);
  return ranges;
}

function regexRanges(text, regex) {
  const ranges = [];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
}

function mergeRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];
  for (const [start, end] of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

/** Splits text into transformable gaps and byte-identical protected spans. */
function splitProtected(text, preserveMarkdown) {
  if (!preserveMarkdown) return [{ text, protected: false }];

  const ranges = mergeRanges([
    ...fencedRanges(text),
    ...regexRanges(text, INLINE_CODE),
    ...regexRanges(text, URL_RE),
    ...regexRanges(text, EMAIL_RE),
  ]);

  if (!ranges.length) return [{ text, protected: false }];

  const parts = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), protected: false });
    parts.push({ text: text.slice(start, end), protected: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), protected: false });
  return parts;
}

/* ─────────────────────────────── stages ─────────────────────────────── */

function stripInvisible(text, opts) {
  let out = '';
  for (const segment of graphemes(text)) {
    if (isEmojiCluster(segment, opts.preserveEmoji)) {
      out += segment;
      continue;
    }
    for (const char of segment) {
      if (!shouldRemove(char.codePointAt(0), opts)) out += char;
    }
  }
  return out;
}

function normalizeWhitespace(text, opts) {
  if (!opts.normalizeSpaces) return text;

  let out = text.replace(SPACE_RE, ' ');
  if (opts.trimLines) {
    // Only trim before a real newline. Trimming at a gap boundary would eat
    // the space that separates prose from inline code.
    out = out.replace(/[ \t]+(?=\n)/g, '');
  }
  if (opts.collapseSpaces) {
    out = out.replace(/ {2,}/g, ' ');
    out = out.replace(/\n{3,}/g, '\n\n');
  }
  out = out.replace(/[ \t]+(?=[,.;:!?])/g, '');
  out = out.replace(/\r\n?/g, '\n');
  return out;
}

function normalizePunctuation(text, opts) {
  if (!opts.normalizePunctuation) return text;

  let out = text
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e]/g, '"')
    .replace(/[\u00ab\u00bb]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\uff01]/g, '!')
    .replace(/[\uff1f]/g, '?')
    .replace(/[\uff0c]/g, ',')
    .replace(/[\uff1b]/g, ';')
    .replace(/[\uff1a]/g, ':')
    .replace(/[\uff08]/g, '(')
    .replace(/[\uff09]/g, ')')
    .replace(/[\uff02]/g, '"')
    .replace(/[\uff07]/g, "'")
    .replace(/[\uff0e]/g, '.');

  if (opts.dashStyle !== 'keep') {
    const replacement = opts.dashStyle === 'comma' ? ', ' : ' - ';
    // Ranges like 2019–2024 read better as 2019-2024 than 2019 - 2024.
    out = out.replace(/(\d)[ \t]*[\u2013\u2014][ \t]*(\d)/g, '$1-$2');
    out = out.replace(/[ \t]*[\u2013\u2014\u2015][ \t]*/g, replacement);
    out = out.replace(/[ \t]*\u2212[ \t]*/g, ' - ');
    out = out.replace(/[\u2010\u2011]/g, '-');
    out = out.replace(/ {2,}/g, ' ');
    out = out.replace(/ +([,.;:!?])/g, '$1');
    out = out.replace(/, ,/g, ',');
    out = out.replace(/^[ \t]+(?=- )/gm, '');
    out = out.replace(/[ \t]+(?=\n)/g, '');
  }

  return out;
}

function foldLetters(text) {
  let out = text.normalize('NFKC');
  out = out.replace(WORD, (word) => {
    if (!/[A-Za-z]/.test(word)) return word;
    let changed = false;
    const folded = Array.from(word)
      .map((char) => {
        const mapped = CONFUSABLES.get(char);
        if (!mapped) return char;
        changed = true;
        return mapped;
      })
      .join('');
    return changed ? folded : word;
  });
  return out;
}

function applyStages(text, opts) {
  let out = text;

  if (opts.stripZeroWidth || opts.stripBidi) out = stripInvisible(out, opts);
  if (opts.normalizeSpaces) out = normalizeWhitespace(out, opts);
  if (opts.normalizePunctuation) out = normalizePunctuation(out, opts);
  if (opts.foldLetters) out = foldLetters(out);
  if (opts.normalizeSpaces) out = normalizeWhitespace(out, { ...opts, trimLines: true });

  return out;
}

/* ─────────────────────────────── public ─────────────────────────────── */

function actionFor(info, opts, inEmoji) {
  if (inEmoji && opts.preserveEmoji) return 'kept (emoji)';
  if (info.group === 'invisible') {
    if (info.rule === 'bidi') return opts.stripBidi ? 'removed' : 'kept';
    return opts.stripZeroWidth ? 'removed' : 'kept';
  }
  if (info.group === 'space') return opts.normalizeSpaces ? 'normalized' : 'kept';
  if (info.group === 'punctuation') {
    if (info.rule === 'dash' && opts.dashStyle === 'keep') return 'kept';
    return opts.normalizePunctuation ? 'normalized' : 'kept';
  }
  return 'kept';
}

const GROUP_ORDER = { invisible: 0, space: 1, punctuation: 2 };

/**
 * Counts every tracked character in the text.
 * Returns findings sorted by group, then frequency.
 */
export function analyze(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!text) return { findings: [], counts: { invisible: 0, space: 0, punctuation: 0 }, total: 0, hidden: 0 };

  const byCodePoint = new Map();

  for (const segment of graphemes(text)) {
    const inEmoji = isEmojiCluster(segment, opts.preserveEmoji);
    for (const char of segment) {
      const cp = char.codePointAt(0);
      const info = INFO.get(cp);
      if (!info) continue;

      let entry = byCodePoint.get(cp);
      if (!entry) {
        entry = {
          code: CODE_POINT(cp),
          char,
          name: info.name,
          short: info.short,
          group: info.group,
          rule: info.rule,
          count: 0,
          emojiCount: 0,
          action: 'kept',
        };
        byCodePoint.set(cp, entry);
      }
      entry.count += 1;
      if (inEmoji) entry.emojiCount += 1;
    }
  }

  const findings = [...byCodePoint.values()].map((entry) => {
    const inEmoji = entry.emojiCount === entry.count;
    return { ...entry, inEmoji, action: actionFor(entry, opts, inEmoji) };
  });

  findings.sort((a, b) => {
    const group = GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
    if (group !== 0) return group;
    if (b.count !== a.count) return b.count - a.count;
    return a.code.localeCompare(b.code);
  });

  const counts = { invisible: 0, space: 0, punctuation: 0 };
  for (const finding of findings) counts[finding.group] += finding.count;

  return {
    findings,
    counts,
    total: counts.invisible + counts.space + counts.punctuation,
    hidden: counts.invisible,
  };
}

function statsFor(text) {
  const chars = Array.from(text).length;
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  let bytes = chars;
  try {
    bytes = new TextEncoder().encode(text).length;
  } catch {
    bytes = text.length;
  }
  return { chars, words, bytes };
}

/**
 * Cleans the text. Returns the cleaned string plus everything the UI needs.
 */
export function sanitize(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!text) {
    const empty = statsFor('');
    return {
      text: '',
      findings: [],
      counts: { invisible: 0, space: 0, punctuation: 0 },
      total: 0,
      hidden: 0,
      stats: { before: empty, after: empty },
      residual: 0,
    };
  }

  const cleaned = splitProtected(text, opts.preserveMarkdown)
    .map((part) => (part.protected ? part.text : applyStages(part.text, opts)))
    .join('');

  const analysis = analyze(text, opts);
  const after = analyze(cleaned, opts);
  const residual = after.findings
    .filter((finding) => finding.action === 'removed' || finding.action === 'normalized')
    .reduce((sum, finding) => sum + finding.count, 0);

  return {
    text: cleaned,
    findings: analysis.findings,
    counts: analysis.counts,
    total: analysis.total,
    hidden: analysis.hidden,
    stats: { before: statsFor(text), after: statsFor(cleaned) },
    residual,
  };
}

/**
 * Splits text into plain runs and visible markers for hidden characters, so
 * the UI can render U+200B as a tappable chip instead of an empty gap.
 */
export function reveal(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const segments = [];
  let buffer = '';

  const flush = () => {
    if (buffer) segments.push({ type: 'text', value: buffer });
    buffer = '';
  };

  for (const segment of graphemes(text)) {
    const inEmoji = isEmojiCluster(segment, opts.preserveEmoji);
    for (const char of segment) {
      const cp = char.codePointAt(0);
      const info = INFO.get(cp);
      const interesting =
        info &&
        (info.group === 'invisible' || (info.group === 'space' && cp !== 0x20)) &&
        !inEmoji;

      if (interesting) {
        flush();
        segments.push({
          type: 'marker',
          value: char,
          code: CODE_POINT(cp),
          name: info.name,
          short: info.short,
          kept: info.group === 'invisible' ? !shouldRemove(cp, opts) : !opts.normalizeSpaces,
        });
      } else {
        buffer += char;
      }
    }
  }
  flush();

  return segments;
}

export function presetOptions(presetId) {
  const preset = PRESETS[presetId] || PRESETS.standard;
  return { ...DEFAULT_OPTIONS, ...preset.options };
}
