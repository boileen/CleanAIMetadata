/**
 * IPTC-IIM writer wrapped in a Photoshop APP13 image resource block.
 * Text is UTF-8 encoded and declared with the CodedCharacterSet dataset.
 */

import {
  asciiBytes,
  utf8Bytes,
  u16be,
  u32be,
  concatBytes,
  padEven,
  truncateUtf8,
} from './binary';

const IPTC_LIMITS = {
  title: 64,
  headline: 256,
  caption: 2000,
  keywords: 64,
  creator: 32,
  copyright: 128,
  credit: 32,
  source: 32,
  contact: 128,
  city: 32,
  state: 32,
  country: 64,
  sublocation: 32,
  countryCode: 3,
  captionWriter: 32,
  instructions: 256,
  jobIdentifier: 32,
  creatorJobTitle: 32,
};

function dataset(record, number, bytes) {
  const length = bytes.length;
  return concatBytes([
    new Uint8Array([0x1c, record, number, (length >> 8) & 0x7f, length & 0xff]),
    bytes,
  ]);
}

function textDataset(record, number, value, maxBytes) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const text = truncateUtf8(String(value), maxBytes);
  return dataset(record, number, utf8Bytes(text));
}

function dateDataset(value) {
  if (!value) return null;
  const text = String(value).trim();
  const match = text.match(/^(\d{4})[-:/]?(\d{2})[-:/]?(\d{2})/);
  if (!match) return null;
  return dataset(2, 55, utf8Bytes(`${match[1]}${match[2]}${match[3]}`));
}

function splitKeywords(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasIptcValues(values = {}) {
  return [
    'title', 'headline', 'caption', 'keywords', 'creator', 'copyright',
    'credit', 'source', 'contact', 'city', 'state', 'country', 'sublocation',
    'countryCode', 'dateCreated', 'captionWriter', 'instructions',
    'jobIdentifier', 'creatorJobTitle',
  ].some((key) => values[key] !== undefined && values[key] !== null && String(values[key]).trim() !== '');
}

/**
 * Build the full APP13 payload (without the JPEG marker/length).
 * @param {Record<string, unknown>} values
 * @returns {Uint8Array}
 */
export function buildIptcApp13(values = {}) {
  const datasets = [];

  // UTF-8 declaration (ESC % G).
  datasets.push(dataset(1, 90, new Uint8Array([0x1b, 0x25, 0x47])));
  // Record version 2.
  datasets.push(dataset(2, 0, new Uint8Array([0x00, 0x02])));

  const add = (entry) => {
    if (entry) datasets.push(entry);
  };

  add(textDataset(2, 5, values.title, IPTC_LIMITS.title));
  add(textDataset(2, 40, values.instructions, IPTC_LIMITS.instructions));
  add(dateDataset(values.dateCreated));
  add(textDataset(2, 80, values.creator, IPTC_LIMITS.creator));
  add(textDataset(2, 85, values.creatorJobTitle, IPTC_LIMITS.creatorJobTitle));
  add(textDataset(2, 90, values.city, IPTC_LIMITS.city));
  add(textDataset(2, 92, values.sublocation, IPTC_LIMITS.sublocation));
  add(textDataset(2, 95, values.state, IPTC_LIMITS.state));
  add(textDataset(2, 100, values.countryCode, IPTC_LIMITS.countryCode));
  add(textDataset(2, 101, values.country, IPTC_LIMITS.country));
  add(textDataset(2, 103, values.jobIdentifier, IPTC_LIMITS.jobIdentifier));
  add(textDataset(2, 105, values.headline, IPTC_LIMITS.headline));
  add(textDataset(2, 110, values.credit, IPTC_LIMITS.credit));
  add(textDataset(2, 115, values.source, IPTC_LIMITS.source));
  add(textDataset(2, 116, values.copyright, IPTC_LIMITS.copyright));
  add(textDataset(2, 118, values.contact, IPTC_LIMITS.contact));
  add(textDataset(2, 120, values.caption, IPTC_LIMITS.caption));
  add(textDataset(2, 122, values.captionWriter, IPTC_LIMITS.captionWriter));

  splitKeywords(values.keywords)
    .slice(0, 64)
    .forEach((keyword) => {
      add(textDataset(2, 25, keyword, IPTC_LIMITS.keywords));
    });

  const iim = concatBytes(datasets.filter(Boolean));

  const resource = concatBytes([
    asciiBytes('8BIM'),
    u16be(0x0404),
    new Uint8Array([0x00, 0x00]), // empty Pascal name, padded
    u32be(iim.length),
    padEven(iim),
  ]);

  return concatBytes([asciiBytes('Photoshop 3.0\0'), resource]);
}

export { IPTC_LIMITS };
