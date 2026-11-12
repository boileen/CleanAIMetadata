import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyze,
  sanitize,
  reveal,
  presetOptions,
  MAX_TEXT_CHARS,
} from '../src/utils/textSanitizer.js';

const clean = (text, options = {}) => sanitize(text, options).text;
const standard = {};
const light = presetOptions('light');
const aggressive = presetOptions('aggressive');

const FAMILY = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}'; // 👨‍👩‍👧
const SCOTLAND = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}'; // 🏴󠁧󠁢󠁳󠁣󠁴󠁿
const HEART = '\u2764\uFE0F'; // ❤️

test('strips zero-width characters and BOMs', () => {
  assert.equal(clean('he\u200Bllo'), 'hello');
  assert.equal(clean('\uFEFFStart'), 'Start');
  assert.equal(clean('a\u2060b'), 'ab');
  assert.equal(clean('a\u200Cb'), 'ab');
  assert.equal(clean('a\u180Eb'), 'ab');
});

test('strips soft hyphens from pasted PDF text', () => {
  assert.equal(clean('hy\u00ADphen\u00ADation'), 'hyphenation');
});

test('keeps emoji sequences intact', () => {
  assert.equal(clean(FAMILY), FAMILY);
  assert.equal(clean(SCOTLAND), SCOTLAND);
  assert.equal(clean(HEART), HEART);
  assert.equal(clean(`hi\u200B ${FAMILY}`), `hi ${FAMILY}`);
});

test('normalises non-breaking and exotic spaces', () => {
  assert.equal(clean('a\u00A0b'), 'a b');
  assert.equal(clean('a\u2009b'), 'a b');
  assert.equal(clean('a\u202Fb'), 'a b');
  assert.equal(clean('a\u3000b'), 'a b');
});

test('collapses runs of spaces and trims line ends', () => {
  assert.equal(clean('too    many   spaces'), 'too many spaces');
  assert.equal(clean('line one   \nline two'), 'line one\nline two');
  assert.equal(clean('CRLF\r\nline'), 'CRLF\nline');
});

test('straightens quotes without breaking apostrophes', () => {
  assert.equal(clean('“Hello,” she said.'), '"Hello," she said.');
  assert.equal(clean("don’t stop"), "don't stop");
  assert.equal(clean('‘quoted’'), "'quoted'");
  assert.equal(clean('«guillemets»'), '"guillemets"');
});

test('replaces em dashes, keeping numeric ranges tight', () => {
  assert.equal(clean('fast—really fast'), 'fast - really fast');
  assert.equal(clean('2019–2024'), '2019-2024');
  assert.equal(clean('a—b', { dashStyle: 'comma' }), 'a, b');
  assert.equal(clean('a—b', { dashStyle: 'keep' }), 'a—b');
});

test('normalises ellipsis and fullwidth punctuation', () => {
  assert.equal(clean('wait…'), 'wait...');
  assert.equal(clean('wow！ really？'), 'wow! really?');
});

test('light preset leaves punctuation alone', () => {
  assert.equal(clean('a—b “x”', light), 'a—b “x”');
  assert.equal(clean('a\u200Bb', light), 'ab');
});

test('aggressive preset folds fullwidth and lookalike letters', () => {
  assert.equal(clean('ＡＢＣ　１２３', aggressive), 'ABC 123');
  assert.equal(clean('p\u0430ypal.com', aggressive), 'paypal.com');
  assert.equal(clean('P\u0391YPAL', aggressive), 'PAYPAL');
});

test('aggressive preset leaves genuine Cyrillic prose alone', () => {
  const russian = 'Привет, как дела?';
  assert.equal(clean(russian, aggressive), russian);
});

test('bidi controls are kept by default and stripped when aggressive', () => {
  const trojan = `invoice\u202Efdp.exe`;
  assert.equal(clean(trojan), trojan);
  assert.equal(clean(trojan, aggressive), 'invoicefdp.exe');
});

test('fenced code and inline code are preserved', () => {
  const fenced = '```js\nconst dash = "a—b";\u200B\nconsole.log(dash);\n```';
  assert.equal(clean(fenced), fenced);

  const inline = 'Run `npm run a—b` now';
  assert.equal(clean(inline), inline);
});

test('markdown protection can be disabled', () => {
  const fenced = '```\na—b\n```';
  assert.equal(clean(fenced, { preserveMarkdown: false }), '```\na - b\n```');
});

test('URLs are left byte-identical', () => {
  const url = 'https://example.com/a—b?x=1';
  assert.equal(clean(url), url);
});

test('sanitizing twice is a no-op', () => {
  const input = `“AI”\u200B text — with\u00A0artifacts…  \n\n\nDone\u00AD`;
  const once = clean(input);
  assert.equal(clean(once), once);
});

test('reports findings and a zero residual', () => {
  const result = sanitize('a\u200Bb\u00A0c—d');
  assert.equal(result.residual, 0);
  assert.ok(result.findings.length >= 3);

  const zwsp = result.findings.find((f) => f.code === 'U+200B');
  assert.equal(zwsp.count, 1);
  assert.equal(zwsp.action, 'removed');

  const nbsp = result.findings.find((f) => f.code === 'U+00A0');
  assert.equal(nbsp.group, 'space');
  assert.equal(nbsp.action, 'normalized');
});

test('counts emoji-internal joiners as kept, not residual', () => {
  const result = sanitize(`x${FAMILY}`);
  assert.equal(result.residual, 0);
  const zwj = result.findings.find((f) => f.code === 'U+200D');
  assert.equal(zwj.action, 'kept (emoji)');

  const counts = analyze(`x${FAMILY}`);
  assert.equal(counts.hidden, 2); // two ZWJs inside one family emoji
});

test('reveal turns invisibles into labelled markers', () => {
  const segments = reveal('a\u200Bb\u00A0c');
  const markers = segments.filter((s) => s.type === 'marker');
  assert.equal(markers.length, 2);
  assert.equal(markers[0].code, 'U+200B');
  assert.equal(markers[0].short, 'ZWSP');
  assert.equal(markers[1].code, 'U+00A0');
  assert.equal(segments.filter((s) => s.type === 'text').map((s) => s.value).join(''), 'abc');
});

test('stats report UTF-8 bytes, chars, and words', () => {
  const result = sanitize('héllo wörld');
  assert.equal(result.stats.before.words, 2);
  assert.equal(result.stats.before.chars, 11);
  assert.equal(result.stats.before.bytes, 13);
});

test('empty input is handled', () => {
  const result = sanitize('');
  assert.equal(result.text, '');
  assert.equal(result.total, 0);
  assert.equal(result.stats.after.chars, 0);
});

test('large paste stays fast', () => {
  const unit = 'The quick brown fox\u200B jumps over the lazy dog — again.\u00A0';
  const input = unit.repeat(Math.ceil(MAX_TEXT_CHARS / unit.length)).slice(0, MAX_TEXT_CHARS);
  const started = Date.now();
  const result = sanitize(input);
  const elapsed = Date.now() - started;

  assert.equal(result.text.includes('\u200B'), false);
  assert.ok(elapsed < 5000, `took ${elapsed}ms`);
});
