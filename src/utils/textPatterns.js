/**
 * Writing-pattern diagnostics.
 *
 * This is deliberately not a detector and not a rewriter. It counts structural
 * habits that readers often notice in machine-drafted prose and quotes the
 * exact sentences so the writer can decide what to change. No score, no
 * percentage, no "AI likelihood".
 *
 * English only: word lists and word boundaries are meaningless in scripts that
 * do not separate words with spaces, so the panel gates on Latin coverage.
 */

const CLICHES = [
  "in today's fast-paced",
  'in the ever-evolving',
  'in the rapidly changing',
  'it is important to note',
  "it's important to note",
  'it is worth noting',
  "it's worth noting",
  'navigating the complexities',
  'navigate the complexities',
  'delve into',
  'delving into',
  'a rich tapestry',
  'tapestry of',
  'the landscape of',
  'in the realm of',
  'the world of',
  'a testament to',
  'testament to',
  'unlock the potential',
  'unlocking the potential',
  'unleash the power',
  'game-changer',
  'game changer',
  'cutting-edge',
  'state-of-the-art',
  'seamless integration',
  'seamlessly integrate',
  'seamlessly',
  'robust solution',
  'leverage the power',
  'leverage',
  'utilize',
  'furthermore',
  'moreover',
  'additionally',
  'in conclusion',
  'at the end of the day',
  'when it comes to',
  'a wide range of',
  'a myriad of',
  'myriad of',
  'a plethora of',
  'plethora',
  'crucial role',
  'pivotal role',
  'paramount',
  'multifaceted',
  'holistic approach',
  'synergy',
  'paradigm shift',
  'revolutionize',
  'revolutionizing',
  'transformative',
  'elevate your',
  'empower',
  'foster innovation',
  'fostering',
  'underscore',
  'underscores',
  'underscoring',
  'highlighting the',
  'showcasing',
  'boasts',
  'boasting',
  'nestled in',
  'vibrant community',
  'breathtaking',
  'meticulous',
  'meticulously',
  'comprehensive guide',
  'comprehensively',
  'plays a vital role',
  'plays a crucial role',
  'plays a significant role',
  'look no further',
  "whether you're looking",
  'whether you are looking',
  'in this article, we',
  'in this guide, we',
  'by harnessing',
  'harnessing the power',
  'the key takeaway',
  'it goes without saying',
];

const CHATBOT = [
  'as an ai language model',
  'as an ai assistant',
  'as a language model',
  "i'm sorry, but",
  'i am unable to',
  'certainly!',
  'certainly,',
  'sure thing',
  "here's a breakdown",
  'here is a breakdown',
  "here's an overview",
  'let me know if you',
  'i hope this helps',
  'feel free to ask',
  'would you like me to',
  'is there anything else',
  'to summarize',
  'in summary,',
];

const STRUCTURE_OPENERS = [
  'firstly',
  'secondly',
  'thirdly',
  'lastly',
  'finally',
  'additionally',
  'moreover',
  'furthermore',
  'overall',
  'conclusion',
  'ultimately',
];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'it', 'we', 'you', 'they', 'i',
  'and', 'but', 'so', 'as', 'if', 'when', 'while', 'for', 'to', 'of', 'in', 'on',
  'with', 'by', 'from', 'at', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
]);

const LATIN = /\p{Script=Latin}/u;
const LETTER = /\p{L}/u;
const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
const MIN_WORDS = 40;

function sentencesOf(text) {
  const out = [];
  const boundary = /[.!?]+["'”’)\]]*\s+/g;
  let start = 0;
  let match;

  while ((match = boundary.exec(text)) !== null) {
    const end = match.index + match[0].length;
    pushSentence(out, text, start, end);
    start = end;
  }
  pushSentence(out, text, start, text.length);
  return out;
}

function pushSentence(out, text, start, end) {
  const raw = text.slice(start, end);
  const trimmed = raw.trim();
  if (!trimmed) return;
  const offset = start + raw.indexOf(trimmed);
  const words = trimmed.match(WORD) || [];
  if (!words.length) return;
  out.push({ text: trimmed, offset, words: words.length });
}

function paragraphsOf(text) {
  const out = [];
  const regex = /[^\n]+(?:\n(?!\s*\n)[^\n]+)*/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const trimmed = match[0].trim();
    if (trimmed) out.push({ text: trimmed, offset: match.index });
  }
  return out;
}

const quote = (text) => (text.length > 150 ? `${text.slice(0, 147)}…` : text);

function sampleOf(sentences, limit = 5) {
  return sentences.slice(0, limit).map((sentence) => ({
    text: quote(sentence.text),
    offset: sentence.offset,
  }));
}

function findPhrases(text, sentences, phrases) {
  const lower = text.toLowerCase();
  const hits = [];

  for (const phrase of phrases) {
    let index = lower.indexOf(phrase);
    while (index !== -1) {
      const end = index + phrase.length;
      const sentence =
        sentences.find((item) => index >= item.offset && index < item.offset + item.text.length) ||
        sentences.find((item) => item.offset >= index && item.offset < end);
      hits.push({
        phrase,
        offset: index,
        sentence: sentence ? quote(sentence.text) : quote(phrase),
        sentenceOffset: sentence ? sentence.offset : index,
      });
      index = lower.indexOf(phrase, end);
    }
  }

  return hits.sort((a, b) => a.offset - b.offset);
}

function groupPhrases(hits, limit = 5) {
  const seen = new Set();
  const samples = [];
  for (const hit of hits) {
    const key = hit.sentenceOffset;
    if (seen.has(key)) continue;
    seen.add(key);
    samples.push({ text: hit.sentence, offset: hit.offset });
    if (samples.length >= limit) break;
  }
  return samples;
}

function standardDeviation(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance) };
}

function movingAverageTypeTokenRatio(words, window = 50) {
  if (words.length < window) return null;
  const lower = words.map((word) => word.toLowerCase());
  let total = 0;
  let windows = 0;
  for (let index = 0; index + window <= lower.length; index += 1) {
    total += new Set(lower.slice(index, index + window)).size / window;
    windows += 1;
  }
  return total / windows;
}

/**
 * @param {string} text
 * @returns {{
 *   available: boolean,
 *   reason?: string,
 *   words: number,
 *   sentences: number,
 *   signals: Array<{ id: string, label: string, summary: string, count: number, samples: Array<{text: string, offset: number}> }>
 * }}
 */
export function analyzePatterns(text) {
  const base = { available: false, words: 0, sentences: 0, signals: [] };
  if (!text || !text.trim()) return base;

  const letters = text.match(/\p{L}/gu) || [];
  const latin = letters.filter((char) => LATIN.test(char)).length;
  const words = text.match(WORD) || [];
  const wordCount = words.length;

  base.words = wordCount;

  if (!letters.length || latin / letters.length < 0.6) {
    return { ...base, reason: 'Writing-pattern checks are English-only.' };
  }
  if (wordCount < MIN_WORDS) {
    return { ...base, reason: 'Add at least 40 words to read writing patterns.' };
  }

  const sentences = sentencesOf(text);
  base.sentences = sentences.length;
  base.available = true;

  const signals = [];

  /* Sentence rhythm — uniform length is the clearest structural tell. */
  const lengths = sentences
    .filter((sentence) => sentence.words >= 3 && sentence.words <= 80)
    .map((sentence) => sentence.words);

  if (lengths.length >= 8) {
    const { mean, sd } = standardDeviation(lengths);
    const uniform = lengths.filter((value) => Math.abs(value - mean) <= 2).length;
    if (sd <= 3.5 && mean >= 12 && mean <= 30) {
      signals.push({
        id: 'rhythm',
        label: 'Uniform sentence length',
        summary: `${lengths.length} sentences average ${Math.round(mean)} words, spread ±${sd.toFixed(
          1,
        )}; ${uniform} sit within two words of the average.`,
        count: uniform,
        samples: sampleOf(sentences, 4),
      });
    }
  }

  /* Repeated openers — the same first two words starting sentence after sentence. */
  const openerMap = new Map();
  for (const sentence of sentences) {
    const first = sentence.text.match(/^[\p{L}\p{N}'’-]+(?:\s+[\p{L}\p{N}'’-]+)?/u);
    if (!first) continue;
    const opener = first[0].toLowerCase();
    if (STOPWORDS.has(opener)) continue;
    const entry = openerMap.get(opener) || { opener, display: first[0], sentences: [] };
    entry.sentences.push(sentence);
    openerMap.set(opener, entry);
  }

  const repeated = [...openerMap.values()]
    .filter((entry) => entry.sentences.length >= 3)
    .sort((a, b) => b.sentences.length - a.sentences.length);

  if (repeated.length) {
    const top = repeated[0];
    signals.push({
      id: 'openers',
      label: 'Repeated sentence openers',
      summary: `${repeated.length} opener${
        repeated.length === 1 ? '' : 's'
      } repeat three or more times, led by “${top.display}” (${top.sentences.length} sentences).`,
      count: repeated.reduce((sum, entry) => sum + entry.sentences.length, 0),
      samples: sampleOf(repeated.flatMap((entry) => entry.sentences).slice(0, 5)),
    });
  }

  /* Stock phrases. */
  const clicheHits = findPhrases(text, sentences, CLICHES);
  if (clicheHits.length) {
    signals.push({
      id: 'cliches',
      label: 'Stock phrases',
      summary: `${clicheHits.length} occurrence${
        clicheHits.length === 1 ? '' : 's'
      } across ${new Set(clicheHits.map((hit) => hit.phrase)).size} phrase${
        new Set(clicheHits.map((hit) => hit.phrase)).size === 1 ? '' : 's'
      }.`,
      count: clicheHits.length,
      samples: groupPhrases(clicheHits),
    });
  }

  /* Chatbot residue — phrases that belong to a conversation, not a document. */
  const chatbotHits = findPhrases(text, sentences, CHATBOT);
  if (chatbotHits.length) {
    signals.push({
      id: 'chatbot',
      label: 'Chatbot phrasing',
      summary: `${chatbotHits.length} phrase${
        chatbotHits.length === 1 ? '' : 's'
      } addressed to a reader rather than written for one.`,
      count: chatbotHits.length,
      samples: groupPhrases(chatbotHits),
    });
  }

  /* Explicit list structure. */
  const structured = sentences.filter((sentence) => {
    const first = sentence.text.match(/^[\p{L}]+/u);
    return first && STRUCTURE_OPENERS.includes(first[0].toLowerCase());
  });
  if (structured.length >= 2) {
    signals.push({
      id: 'structure',
      label: 'List-style transitions',
      summary: `${structured.length} sentences start with a sequencing word such as “Firstly” or “In conclusion”.`,
      count: structured.length,
      samples: sampleOf(structured),
    });
  }

  /* One-sentence paragraphs. */
  const paragraphs = paragraphsOf(text);
  if (paragraphs.length >= 5) {
    const single = paragraphs.filter((paragraph) => {
      const count = sentences.filter(
        (sentence) =>
          sentence.offset >= paragraph.offset &&
          sentence.offset < paragraph.offset + paragraph.text.length,
      ).length;
      return count === 1 && (paragraph.text.match(WORD) || []).length >= 6;
    });
    if (single.length >= 3) {
      signals.push({
        id: 'paragraphs',
        label: 'One-sentence paragraphs',
        summary: `${single.length} of ${paragraphs.length} paragraphs hold a single sentence.`,
        count: single.length,
        samples: sampleOf(
          single.map((paragraph) => ({ text: paragraph.text, offset: paragraph.offset })),
        ),
      });
    }
  }

  /* Word variety over a moving window, so long documents are not penalised. */
  const mattr = movingAverageTypeTokenRatio(words);
  if (mattr !== null && mattr < 0.66) {
    signals.push({
      id: 'variety',
      label: 'Repeated vocabulary',
      summary: `Moving type-token ratio is ${mattr.toFixed(2)} over 50-word windows; repeated words dominate.`,
      count: Math.round((0.66 - mattr) * 100),
      samples: [],
    });
  }

  return { ...base, signals };
}
