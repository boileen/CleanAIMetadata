import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzePatterns } from '../src/utils/textPatterns.js';

const AI_SAMPLE = `In today's fast-paced digital landscape, it is important to note that content creation has become increasingly complex. Furthermore, organizations must leverage cutting-edge tools to remain competitive. Moreover, these solutions enable teams to streamline workflows effectively. Additionally, robust platforms provide comprehensive capabilities for modern businesses. In conclusion, embracing these transformative technologies is crucial for success.`;

const HUMAN_SAMPLE = `I rewrote the intro three times before it sounded right. The problem was not the words; it was that every sentence had the same shape. So I cut half of them. Shorter. Then I read it aloud on the walk to the station, which is where most of my edits happen. By the time I sat down, the paragraph had stopped performing and started explaining.`;

const UNIFORM = Array.from(
  { length: 10 },
  (_, index) => `The team reviewed the plan for week ${index + 1} and noted the same concerns again.`,
).join(' ');

test('short text is not scored', () => {
  const result = analyzePatterns('Too short to say anything useful.');
  assert.equal(result.available, false);
  assert.match(result.reason, /40 words/);
  assert.deepEqual(result.signals, []);
});

test('non-Latin text is declined rather than guessed at', () => {
  const russian = 'Это достаточно длинный текст на русском языке, который содержит много слов и предложений. '.repeat(3);
  const result = analyzePatterns(russian);
  assert.equal(result.available, false);
  assert.match(result.reason, /English-only/);
});

test('stock phrases and list transitions are reported with counts', () => {
  const result = analyzePatterns(AI_SAMPLE);
  assert.equal(result.available, true);

  const ids = result.signals.map((signal) => signal.id);
  assert.ok(ids.includes('cliches'));
  assert.ok(ids.includes('structure'));

  const cliches = result.signals.find((signal) => signal.id === 'cliches');
  assert.ok(cliches.count >= 5);
  assert.ok(cliches.samples.length > 0);
});

test('human sample reports no stock-phrase or structure signals', () => {
  const result = analyzePatterns(HUMAN_SAMPLE);
  const ids = result.signals.map((signal) => signal.id);
  assert.equal(ids.includes('cliches'), false);
  assert.equal(ids.includes('structure'), false);
});

test('uniform sentence length is flagged only with enough sentences', () => {
  const result = analyzePatterns(UNIFORM);
  const rhythm = result.signals.find((signal) => signal.id === 'rhythm');
  assert.ok(rhythm, 'expected a rhythm signal');
  assert.match(rhythm.summary, /sentences average/);
});

test('repeated openers are grouped', () => {
  const text = Array.from(
    { length: 4 },
    (_, index) =>
      `The team reviewed milestone ${index + 1} with the same care and the same questions about scope.`,
  ).join(' ');
  const result = analyzePatterns(text);
  const openers = result.signals.find((signal) => signal.id === 'openers');
  assert.ok(openers);
  assert.match(openers.summary, /The team/);
});

test('every quoted sample points inside the source text', () => {
  for (const sample of [AI_SAMPLE, HUMAN_SAMPLE, UNIFORM]) {
    const result = analyzePatterns(sample);
    for (const signal of result.signals) {
      for (const quote of signal.samples) {
        assert.ok(quote.offset >= 0);
        assert.ok(quote.offset < sample.length);
        assert.ok(quote.text.length > 0);
      }
    }
  }
});

test('analysis is deterministic', () => {
  assert.deepEqual(analyzePatterns(AI_SAMPLE), analyzePatterns(AI_SAMPLE));
});
