/**
 * Deterministic text sanitiser.
 *
 * One walk over grapheme clusters decides what each character is, whether the
 * text around it needs it, and what the output should contain. Pure string
 * functions with no DOM or React dependency, so the same code runs in the
 * browser and under `node --test`.
 *
 * Three rules govern the design:
 *  1. Never touch emoji sequences. U+200D, variation selectors, and tag
 *     characters are load-bearing inside glyphs like 👨‍👩‍👧 or 🏴󠁧󠁢󠁳󠁣󠁴󠁿.
 *  2. Never touch code, URLs, or emails when "protect code" is on.
 *  3. Never guess at a script. Joiners stay inside Arabic and Indic words
 *     because those scripts need them to spell words correctly.
 *
 * The character tables come from a generated file pinned to one Unicode
 * version; see `scripts/gen-unicode.mjs`.
 */

import { CONFUSABLES } from '../data/confusables.js';
import { DASHES, HAZARD_RANGES, SPACES, UNICODE_VERSION } from '../data/unicodeHazards.generated.js';
import { decodeHiddenPayload, findAiTags, stripAiReferrer } from './textAiTags.js';

export { UNICODE_VERSION };
export { decodeHiddenPayload };

/* ────────────────────────── character tables ────────────────────────── */

const NAMED = new Map([
  [0x200b, 'ZWSP'],
  [0x200c, 'ZWNJ'],
  [0x200d, 'ZWJ'],
  [0x2060, 'WJ'],
  [0xfeff, 'BOM'],
  [0x180e, 'MVS'],
  [0x00ad, 'SHY'],
  [0x00a0, 'NBSP'],
  [0x202f, 'NNBSP'],
  [0x2009, 'THSP'],
  [0x2007, 'FIGSP'],
  [0x2003, 'EMSP'],
  [0x2002, 'ENSP'],
  [0x3000, 'IDSP'],
  [0x2028, 'LSEP'],
  [0x2029, 'PSEP'],
  [0x2018, '‘'],
  [0x2019, '’'],
  [0x201c, '“'],
  [0x201d, '”'],
  [0x2026, '…'],
  [0xff01, '！'],
  [0xff1f, '？'],
  [0xe0001, 'TAG'],
]);

const INFO = new Map();

function add(cp, info) {
  INFO.set(cp, info);
}

for (const range of HAZARD_RANGES) {
  for (let cp = range.from; cp <= range.to; cp += 1) {
    const name = range.name.includes('{n}')
      ? range.name.replace('{n}', String(cp - range.from + 1))
      : range.name;
    add(cp, {
      name,
      short: shortLabel(cp, name),
      group: 'invisible',
      rule: range.rule,
    });
  }
}

for (const space of SPACES) {
  add(space.cp, {
    name: space.name,
    short: spaceShort(space.cp, space.name),
    group: 'space',
    rule: 'space',
  });
}

for (const dash of DASHES) {
  if (dash.cp === 0x2d) continue; // plain ASCII hyphen needs no reporting
  add(dash.cp, {
    name: dash.name,
    short: dash.cp === 0x2014 ? '—' : dash.cp === 0x2013 ? '–' : dash.cp === 0x2212 ? '−' : '-',
    group: 'punctuation',
    rule: 'dash',
  });
}

function shortLabel(cp, name) {
  if (NAMED.has(cp)) return NAMED.get(cp);
  if (cp >= 0xfe00 && cp <= 0xfe0f) return `VS${cp - 0xfe00 + 1}`;
  if (cp >= 0xe0100 && cp <= 0xe01ef) return `VS${cp - 0xe0100 + 17}`;
  if (cp >= 0xe0020 && cp <= 0xe007f) return 'TAG';
  if (cp >= 0x202a && cp <= 0x202e) return 'BIDI';
  if (cp >= 0x2066 && cp <= 0x2069) return 'BIDI';
  const first = name.split(/[\s-]/)[0];
  return first.length > 7 ? first.slice(0, 7) : first;
}

function spaceShort(cp, name) {
  if (NAMED.has(cp)) return NAMED.get(cp);
  return name.split(' ')[0].slice(0, 7);
}

function punctInfo(cp) {
  const single = {
    0x2018: "LEFT SINGLE QUOTATION MARK",
    0x2019: 'RIGHT SINGLE QUOTATION MARK',
    0x201a: 'SINGLE LOW-9 QUOTATION MARK',
    0x201b: 'SINGLE HIGH-REVERSED-9 QUOTATION MARK',
    0x201c: 'LEFT DOUBLE QUOTATION MARK',
    0x201d: 'RIGHT DOUBLE QUOTATION MARK',
    0x201e: 'DOUBLE LOW-9 QUOTATION MARK',
    0x00ab: 'LEFT-POINTING DOUBLE ANGLE QUOTATION MARK',
    0x00bb: 'RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK',
    0x2026: 'HORIZONTAL ELLIPSIS',
    0xff01: 'FULLWIDTH EXCLAMATION MARK',
    0xff1f: 'FULLWIDTH QUESTION MARK',
    0xff0c: 'FULLWIDTH COMMA',
    0xff1b: 'FULLWIDTH SEMICOLON',
    0xff1a: 'FULLWIDTH COLON',
    0xff08: 'FULLWIDTH LEFT PARENTHESIS',
    0xff09: 'FULLWIDTH RIGHT PARENTHESIS',
    0xff02: 'FULLWIDTH QUOTATION MARK',
    0xff07: 'FULLWIDTH APOSTROPHE',
    0xff0e: 'FULLWIDTH FULL STOP',
  };
  const name = single[cp];
  if (!name) return null;
  if (NAMED.has(cp)) {
    return { name, short: NAMED.get(cp), group: 'punctuation', rule: 'punct' };
  }
  if (cp >= 0x00ab && cp <= 0x00bb) {
    return { name, short: cp === 0x00ab ? '«' : '»', group: 'punctuation', rule: 'quote' };
  }
  return { name, short: String.fromCodePoint(cp), group: 'punctuation', rule: 'quote' };
}

for (const cp of [0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x201e, 0x00ab, 0x00bb]) {
  const info = punctInfo(cp);
  if (info) add(cp, info);
}
for (const cp of [0xff01, 0xff1f, 0xff0c, 0xff1b, 0xff1a, 0xff08, 0xff09, 0xff02, 0xff07, 0xff0e, 0x2026]) {
  const info = punctInfo(cp);
  if (info) add(cp, { ...info, rule: 'punct' });
}

/* ────────────────────────────── presets ─────────────────────────────── */

export const PRESETS = {
  light: {
    id: 'light',
    label: 'Light',
    hint: 'Invisible characters and AI tags',
    options: {
      stripZeroWidth: true,
      stripBidi: false,
      normalizeSpaces: false,
      normalizePunctuation: false,
      foldLetters: false,
      stripAiMetadata: false,
    },
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    hint: 'Adds spaces and typography',
    options: {
      stripZeroWidth: true,
      stripBidi: false,
      normalizeSpaces: true,
      normalizePunctuation: true,
      foldLetters: false,
      stripAiMetadata: false,
    },
  },
  aggressive: {
    id: 'aggressive',
    label: 'Aggressive',
    hint: 'Adds bidi controls and lookalikes',
    options: {
      stripZeroWidth: true,
      stripBidi: true,
      normalizeSpaces: true,
      normalizePunctuation: true,
      foldLetters: true,
      stripAiMetadata: true,
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
  removeEmoji: false,
  stripAiLinks: true,
  stripChatMarkers: true,
};

export const MAX_TEXT_CHARS = 200_000;

/* ───────────────────────────── helpers ──────────────────────────────── */

const PICTO = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const WORD = /[\p{L}\p{M}]+/gu;
const LETTER = /[\p{L}\p{M}\p{N}]/u;
const JOINING_SCRIPT =
  /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Myanmar}\p{Script=Khmer}]/u;
const UNIT = /[\p{L}%‰°℃℉$€£¥]/u;

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

const CODE_POINT = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

function isEmojiCluster(segment) {
  return PICTO.test(segment);
}

function isControl(cp) {
  return (
    cp <= 0x08 ||
    cp === 0x0b ||
    cp === 0x0c ||
    (cp >= 0x0e && cp <= 0x1f) ||
    (cp >= 0x7f && cp <= 0x9f)
  );
}

const CONTROL_INFO = {
  name: 'CONTROL CHARACTER',
  short: 'CTRL',
  group: 'invisible',
  rule: 'zeroWidth',
};

function infoFor(cp) {
  return INFO.get(cp) || (isControl(cp) ? CONTROL_INFO : null);
}

function layoutNeedsSpace(prev, next) {
  if (!prev || !next) return false;
  if (/\d/u.test(prev) && UNIT.test(next)) return true;
  if (/\d/u.test(next) && /[$€£¥]/u.test(prev)) return true;
  return false;
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
        ranges.push([open, offset + line.length, 'code']);
        open = -1;
      }
    }
    offset += line.length + 1;
  }

  if (open !== -1) ranges.push([open, text.length, 'code']);
  return ranges;
}

function regexRanges(text, regex, kind) {
  const ranges = [];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    ranges.push([match.index, match.index + match[0].length, kind]);
  }
  return ranges;
}

function mergeRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [sorted[0]];
  for (const [start, end, kind] of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
      if (last[2] !== 'code' && kind === 'code') last[2] = 'code';
    } else {
      merged.push([start, end, kind]);
    }
  }
  return merged;
}

/**
 * Splits text into transformable gaps and byte-identical protected spans.
 * Code wins over everything else when ranges overlap.
 */
function splitProtected(text, preserveMarkdown) {
  if (!preserveMarkdown) return [{ text, kind: 'text', start: 0 }];

  const ranges = mergeRanges([
    ...fencedRanges(text),
    ...regexRanges(text, INLINE_CODE, 'code'),
    ...regexRanges(text, URL_RE, 'url'),
    ...regexRanges(text, EMAIL_RE, 'email'),
  ]);

  if (!ranges.length) return [{ text, kind: 'text', start: 0 }];

  const parts = [];
  let cursor = 0;
  for (const [start, end, kind] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), kind: 'text', start: cursor });
    parts.push({ text: text.slice(start, end), kind, start });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), kind: 'text', start: cursor });
  return parts;
}

/* ─────────────────────────────── stages ─────────────────────────────── */

function stripInvisible(text, opts) {
  let out = '';
  let clusters;
  try {
    clusters = [...graphemes(text)];
  } catch {
    clusters = Array.from(text);
  }

  for (let index = 0; index < clusters.length; index += 1) {
    const segment = clusters[index];
    const prev = clusters[index - 1] || '';
    const next = clusters[index + 1] || '';

    if (opts.removeEmoji && isEmojiCluster(segment)) continue;

    if (opts.preserveEmoji && isEmojiCluster(segment)) {
      out += segment;
      continue;
    }

    const prevChar = [...prev].pop() || '';
    const nextChar = (next[0] || '');

    const chars = [...segment];
    for (let charIndex = 0; charIndex < chars.length; charIndex += 1) {
      const char = chars[charIndex];
      const before = chars[charIndex - 1] || prevChar;
      const after = chars[charIndex + 1] || nextChar;
      const joiningContext = JOINING_SCRIPT.test(before) || JOINING_SCRIPT.test(after);

      const cp = char.codePointAt(0);
      const info = infoFor(cp);
      if (!info) {
        out += char;
        continue;
      }

      if (info.group === 'space') {
        if (!opts.normalizeSpaces) {
          out += char;
        } else if (layoutNeedsSpace(prevChar, nextChar) && (cp === 0x00a0 || cp === 0x202f)) {
          out += char;
        } else {
          out += ' ';
        }
        continue;
      }

      if (info.group !== 'invisible') {
        out += char;
        continue;
      }

      if (cp === 0x200c || cp === 0x200d) {
        if (joiningContext) out += char;
        continue;
      }

      if (cp === 0x00ad) continue; // soft hyphen: join the word, never add a space

      if (info.rule === 'bidi') {
        if (!opts.stripBidi) out += char;
        continue;
      }

      if (!opts.stripZeroWidth) out += char;
    }
  }

  return out;
}

function normalizeWhitespace(text, opts) {
  let out = text.replace(/\r\n?/g, '\n');

  if (opts.trimLines) out = out.replace(/[ \t]+(?=\n)/g, '');
  if (opts.collapseSpaces) {
    out = out.replace(/ {2,}/g, ' ');
    out = out.replace(/\n{3,}/g, '\n\n');
  }
  out = out.replace(/[ \t]+(?=[,.;:!?])/g, '');
  return out;
}

function normalizePunctuation(text, opts) {
  if (!opts.normalizePunctuation) return text;

  let out = text
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e]/g, '"')
    .replace(/[\u00ab\u00bb]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\uff01/g, '!')
    .replace(/\uff1f/g, '?')
    .replace(/\uff0c/g, ',')
    .replace(/\uff1b/g, ';')
    .replace(/\uff1a/g, ':')
    .replace(/\uff08/g, '(')
    .replace(/\uff09/g, ')')
    .replace(/\uff02/g, '"')
    .replace(/\uff07/g, "'")
    .replace(/\uff0e/g, '.');

  if (opts.dashStyle !== 'keep') {
    const replacement = opts.dashStyle === 'comma' ? ', ' : ' - ';
    // Ranges like 2019–2024 read better as 2019-2024 than 2019 - 2024.
    out = out.replace(/(\d)[ \t]*[\u2013\u2014][ \t]*(\d)/g, '$1-$2');
    out = out.replace(/[ \t]*[\u2013\u2014\u2015][ \t]*/g, replacement);
    out = out.replace(/[ \t]*\u2212[ \t]*/g, ' - ');
    out = out.replace(/[\u2010\u2011]/g, '-');
    out = out.replace(/ {2,}/g, ' ');
    out = out.replace(/ +(?=[,.;:!?])/g, '');
    out = out.replace(/, ,/g, ',');
    out = out.replace(/^[ \t]+(?=- )/gm, '');
  }

  return out;
}

function foldLetters(text) {
  const out = text.normalize('NFKC');
  return out.replace(WORD, (word) => {
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
}

function applyStages(text, opts) {
  let out = text;

  if (opts.stripZeroWidth || opts.stripBidi || opts.removeEmoji) out = stripInvisible(out, opts);
  if (opts.normalizeSpaces) out = normalizeWhitespace(out, opts);
  if (opts.normalizePunctuation) out = normalizePunctuation(out, opts);
  if (opts.foldLetters) out = foldLetters(out);
  if (out && (opts.normalizeSpaces || opts.normalizePunctuation)) out = normalizeWhitespace(out, opts);

  return out;
}

function sanitizeGap(text, opts) {
  let out = text;

  if (opts.stripZeroWidth || opts.stripBidi || opts.removeEmoji) {
    const stripped = stripInvisible(out, opts);
    if (opts.normalizePunctuation) {
      // Dashes sit inside gaps; let the punctuation pass handle them once.
      out = stripped;
    } else {
      out = stripped;
    }
  }

  if (opts.normalizeSpaces) out = normalizeWhitespace(out, opts);
  if (opts.normalizePunctuation) out = normalizePunctuation(out, opts);
  if (opts.foldLetters) out = foldLetters(out);
  if (opts.normalizeSpaces) out = normalizeWhitespace(out, opts);

  return out;
}

/* ─────────────────────────────── public ─────────────────────────────── */

function actionFor(info, opts, inEmoji, prevChar, nextChar) {
  if (inEmoji && opts.preserveEmoji) return 'kept (emoji)';
  if (info.group === 'invisible') {
    if (info.rule === 'bidi') return opts.stripBidi ? 'removed' : 'kept';
    if (info.rule === 'zeroWidth') return opts.stripZeroWidth ? 'removed' : 'kept';
    return 'kept';
  }
  if (info.group === 'space') {
    if (!opts.normalizeSpaces) return 'kept';
    if (layoutNeedsSpace(prevChar, nextChar)) return 'kept (layout)';
    return 'normalized';
  }
  if (info.group === 'punctuation') {
    if (info.rule === 'dash' && opts.dashStyle === 'keep') return 'kept';
    return opts.normalizePunctuation ? 'normalized' : 'kept';
  }
  return 'kept';
}

const GROUP_ORDER = { invisible: 0, space: 1, punctuation: 2, ai: 3 };

function pushFinding(map, cp, char, info, position, inEmoji, opts, prevChar, nextChar) {
  let entry = map.get(cp);
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
      positions: [],
      action: actionFor(info, opts, false, prevChar, nextChar),
    };
    map.set(cp, entry);
  }
  entry.count += 1;
  if (inEmoji) entry.emojiCount += 1;
  if (entry.positions.length < 50) entry.positions.push(position);
}

/**
 * Counts every tracked character in the text.
 * Returns findings sorted by group, then frequency.
 */
export function analyze(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const empty = {
    findings: [],
    counts: { invisible: 0, space: 0, punctuation: 0, ai: 0 },
    total: 0,
    hidden: 0,
  };
  if (!text) return empty;

  const byCodePoint = new Map();
  let position = 0;
  let clusters;
  try {
    clusters = [...graphemes(text)];
  } catch {
    clusters = Array.from(text);
  }

  for (let index = 0; index < clusters.length; index += 1) {
    const segment = clusters[index];
    const prev = clusters[index - 1] || '';
    const next = clusters[index + 1] || '';
    const inEmoji = opts.preserveEmoji && isEmojiCluster(segment);
    const prevChar = [...prev].pop() || '';
    const nextChar = next[0] || '';

    for (const char of segment) {
      const cp = char.codePointAt(0);
      const info = infoFor(cp);
      if (info) pushFinding(byCodePoint, cp, char, info, position, inEmoji, opts, prevChar, nextChar);
      position += char.length;
    }
  }

  const findings = [...byCodePoint.values()].map((entry) => {
    const inEmoji = entry.count > 0 && entry.emojiCount === entry.count;
    return {
      ...entry,
      inEmoji,
      action: actionFor(entry, opts, inEmoji, '', ''),
    };
  });

  findings.sort((a, b) => {
    const group = GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
    if (group !== 0) return group;
    if (b.count !== a.count) return b.count - a.count;
    return a.code.localeCompare(b.code);
  });

  const counts = { invisible: 0, space: 0, punctuation: 0, ai: 0 };
  for (const finding of findings) counts[finding.group] += finding.count;

  const ai = summarizeAiTags(text, opts);
  findings.push(...ai.findings);
  counts.ai = ai.count;

  return {
    findings,
    counts,
    total: counts.invisible + counts.space + counts.punctuation + counts.ai,
    hidden: counts.invisible,
  };
}

function summarizeAiTags(text, opts) {
  const tags = findAiTags(text);
  const groups = new Map();

  for (const tag of tags) {
    let entry = groups.get(tag.kind);
    if (!entry) {
      entry = {
        code:
          tag.kind === 'metadata'
            ? 'AI-META'
            : tag.kind === 'referrer'
              ? 'AI-LINK'
              : 'AI-CHAT',
        char: '',
        name:
          tag.kind === 'metadata'
            ? 'AI TOOL NAME IN METADATA'
            : tag.kind === 'referrer'
              ? 'AI REFERRER TAG IN LINK'
              : 'CHAT-EXPORT MARKER',
        short: tag.kind === 'metadata' ? 'META' : tag.kind === 'referrer' ? 'LINK' : 'CHAT',
        group: 'ai',
        rule: tag.kind,
        count: 0,
        emojiCount: 0,
        positions: [],
        action: 'kept',
      };
      groups.set(tag.kind, entry);
    }
    entry.count += 1;
    entry.positions.push(tag.start);
  }

  const findings = [...groups.values()].map((entry) => {
    if (entry.rule === 'metadata') {
      entry.action = opts.stripAiMetadata ? 'removed' : 'kept for review';
    } else if (entry.rule === 'referrer') {
      entry.action = opts.stripAiLinks ? 'removed' : 'kept';
    } else {
      entry.action = opts.stripChatMarkers ? 'removed' : 'kept';
    }
    return entry;
  });

  return { findings, count: findings.reduce((sum, finding) => sum + finding.count, 0) };
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
      counts: { invisible: 0, space: 0, punctuation: 0, ai: 0 },
      total: 0,
      hidden: 0,
      stats: { before: empty, after: empty },
      residual: 0,
      payloads: [],
    };
  }

  const tags = findAiTags(text);
  const cuts = tags
    .filter((tag) => {
      if (tag.kind === 'metadata') return opts.stripAiMetadata;
      if (tag.kind === 'chat') return opts.stripChatMarkers;
      return false; // referrers are stripped inside URL segments
    })
    .map((tag) => {
      const start = tag.start > 0 && text[tag.start - 1] === ' ' ? tag.start - 1 : tag.start;
      return [start, tag.end, 'cut'];
    });

  const protectedParts = splitProtected(text, opts.preserveMarkdown);
  const protectedRanges = protectedParts
    .filter((part) => part.kind !== 'text')
    .map((part) => [part.start, part.start + part.text.length, part.kind]);

  // Split at every boundary, then label each atom with the strongest claim:
  // removed AI metadata wins over plain text, but code and URLs stay intact.
  const points = new Set([0, text.length]);
  for (const range of [...protectedRanges, ...cuts]) {
    points.add(range[0]);
    points.add(range[1]);
  }
  const ordered = [...points].sort((a, b) => a - b);
  const sortedCuts = [...cuts].sort((a, b) => a[0] - b[0]);

  let output = '';
  let cutIndex = 0;
  let rangeIndex = 0;

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const start = ordered[index];
    const end = ordered[index + 1];
    if (start === end) continue;

    while (cutIndex < sortedCuts.length && sortedCuts[cutIndex][1] <= start) cutIndex += 1;
    const activeCut = sortedCuts[cutIndex];
    if (activeCut && start >= activeCut[0] && end <= activeCut[1]) continue;

    while (
      rangeIndex < protectedRanges.length &&
      protectedRanges[rangeIndex][1] <= start
    ) {
      rangeIndex += 1;
    }

    const holder = protectedRanges[rangeIndex];
    const inHolder = holder && start >= holder[0] && end <= holder[1];
    const slice = text.slice(start, end);

    if (!inHolder) {
      output += sanitizeGap(slice, opts);
    } else if (holder[2] === 'url') {
      output += opts.stripAiLinks ? stripAiReferrer(slice) : slice;
    } else {
      output += slice;
    }
  }

  const analysis = analyze(text, opts);
  const after = analyze(output, opts);
  const residual = after.findings
    .filter((finding) => finding.action === 'removed' || finding.action === 'normalized')
    .reduce((sum, finding) => sum + finding.count, 0);

  return {
    text: output,
    findings: analysis.findings,
    counts: analysis.counts,
    total: analysis.total,
    hidden: analysis.hidden,
    stats: { before: statsFor(text), after: statsFor(output) },
    residual,
    payloads: decodeHiddenPayload(text),
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
    const inEmoji = opts.preserveEmoji && isEmojiCluster(segment);
    for (const char of segment) {
      const cp = char.codePointAt(0);
      const info = infoFor(cp);
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
