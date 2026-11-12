/**
 * String-level detection of AI provenance leftovers.
 *
 * Three families, all visible text — no character tables involved:
 *  - metadata: `generator:` lines and `<meta name="generator">` blocks
 *  - referrer: `utm_source=chatgpt.com` and friends on links
 *  - chat: `:contentReference[oaicite:0]{index=0}` and similar export junk
 *
 * Pure functions so the same rules run in the browser and under `node --test`.
 */

const METADATA_LINE =
  /^[ \t]*(?:generator|creator[_-]?tool|ai[_-]?tool|software)[ \t]*:[ \t]*(.+?)[ \t]*$/gim;
const METADATA_HTML =
  /<meta\s+[^>]*name=["'](?:generator|ai[_-]?tool|creator[_-]?tool)["'][^>]*>/gi;
const CHAT_MARKERS = [
  /:contentReference\[[^\]]*\]\{[^}]*\}/g,
  /\[oaicite:\d+\]/g,
  /【\d+†[^】]*】/g,
];
const URL_RE = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
const LINK_PARAM = /(?:^|[?&])(?:utm_source|utm_medium|utm_campaign|source|referrer|ref)=([^&#]+)/gi;
const AI_PROVIDERS =
  /(?:chatgpt|openai|claude|anthropic|gemini|bard|perplexity|grok|xai|copilot|poe)\.?/i;
const LINK_KEYS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'source',
  'referrer',
  'ref',
]);

function findMetadataTags(text) {
  const tags = [];
  METADATA_LINE.lastIndex = 0;
  let match;
  while ((match = METADATA_LINE.exec(text)) !== null) {
    tags.push({
      kind: 'metadata',
      label: match[0].trim(),
      value: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  METADATA_HTML.lastIndex = 0;
  while ((match = METADATA_HTML.exec(text)) !== null) {
    tags.push({
      kind: 'metadata',
      label: match[0],
      value: 'generator',
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tags;
}

function findChatMarkers(text) {
  const found = [];
  for (const regex of CHAT_MARKERS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.push({
        kind: 'chat',
        label: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Export junk nests: one reference can contain another. Keep the outer span.
  return found
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((tag, index, all) => {
      for (let previous = 0; previous < index; previous += 1) {
        if (tag.start >= all[previous].start && tag.end <= all[previous].end) return false;
      }
      return true;
    });
}

function findReferrers(text) {
  const tags = [];
  URL_RE.lastIndex = 0;
  let url;
  while ((url = URL_RE.exec(text)) !== null) {
    LINK_PARAM.lastIndex = 0;
    let param;
    while ((param = LINK_PARAM.exec(url[0])) !== null) {
      if (!AI_PROVIDERS.test(param[1])) continue;
      let provider = param[1];
      try {
        provider = decodeURIComponent(provider);
      } catch {
        /* keep raw */
      }
      tags.push({
        kind: 'referrer',
        label: `${provider.replace(/\.$/, '')} link tag`,
        start: url.index + param.index,
        end: url.index + param.index + param[0].length,
      });
    }
  }
  return tags;
}

export function findAiTags(text) {
  return [...findMetadataTags(text), ...findChatMarkers(text), ...findReferrers(text)].sort(
    (a, b) => a.start - b.start,
  );
}

/** Removes AI referrer parameters while keeping the rest of the URL valid. */
export function stripAiReferrer(url) {
  const hashIndex = url.indexOf('#');
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const queryIndex = base.indexOf('?');
  if (queryIndex === -1) return url;

  const prefix = base.slice(0, queryIndex);
  const params = base
    .slice(queryIndex + 1)
    .split('&')
    .filter(Boolean)
    .filter((pair) => !isAiParam(pair));

  return `${prefix}${params.length ? `?${params.join('&')}` : ''}${hash}`;
}

function isAiParam(pair) {
  const equals = pair.indexOf('=');
  if (equals === -1) return false;
  const key = pair.slice(0, equals).toLowerCase();
  if (!LINK_KEYS.has(key)) return false;
  let value = pair.slice(equals + 1);
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep the raw value */
  }
  return AI_PROVIDERS.test(value);
}

/**
 * Tag characters (U+E0020–U+E007F) spell ASCII in plain sight. A run of them
 * can carry a whole sentence past a reader and even past some review tools.
 * Returns any decoded runs long enough to be meaningful.
 */
export function decodeHiddenPayload(text) {
  const payloads = [];
  let buffer = '';

  const flush = () => {
    const readable = buffer.replace(/[^\x20-\x7e]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (readable.length >= 4 && /[A-Za-z]{2}/.test(readable)) {
      payloads.push({ text: readable, chars: buffer.length });
    }
    buffer = '';
  };

  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp >= 0xe0020 && cp <= 0xe007f) {
      buffer += String.fromCharCode(cp - 0xe0000);
    } else if (cp !== 0xe0000 && cp !== 0xe0001) {
      if (buffer) flush();
    }
  }
  if (buffer) flush();

  return payloads;
}
