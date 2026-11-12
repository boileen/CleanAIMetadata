/**
 * Generates `src/data/unicodeHazards.generated.js` from the official Unicode
 * Character Database, pinned to one version.
 *
 * Run manually — the generated file is committed, so builds stay offline and
 * deterministic:
 *
 *   node scripts/gen-unicode.mjs
 *   node scripts/gen-unicode.mjs --check   # exit 1 if the file is stale
 */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const VERSION = '17.0.0';
const BASE = `https://www.unicode.org/Public/${VERSION}/ucd`;
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/unicodeHazards.generated.js',
);

const BIDI = [
  [0x061c, 0x061c],
  [0x200e, 0x200f],
  [0x202a, 0x202e],
  [0x2066, 0x2069],
];

const inRanges = (cp, ranges) => ranges.some(([from, to]) => cp >= from && cp <= to);

async function fetchText(name) {
  const response = await fetch(`${BASE}/${name}`);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return response.text();
}

function parseUnicodeData(text) {
  const entries = new Map();
  for (const line of text.split('\n')) {
    if (!line) continue;
    const fields = line.split(';');
    const cp = Number.parseInt(fields[0], 16);
    const name = fields[1];
    const generalCategory = fields[2];
    if (name.startsWith('<') && name.endsWith('>')) continue;
    entries.set(cp, { name, generalCategory });
  }
  return entries;
}

function parsePropertyRanges(text, property) {
  const ranges = [];
  for (const line of text.split('\n')) {
    const clean = line.replace(/#.*/, '').trim();
    if (!clean) continue;
    const [range, prop] = clean.split(';').map((part) => part.trim());
    if (!prop || !prop.split(/\s+/).includes(property)) continue;
    const [from, to = from] = range.split('..');
    ranges.push([Number.parseInt(from, 16), Number.parseInt(to, 16)]);
  }
  return ranges;
}

const escape = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function compress(entries) {
  const sorted = [...entries].sort((a, b) => a.cp - b.cp);
  const out = [];

  for (const entry of sorted) {
    const last = out[out.length - 1];
    if (last && entry.cp === last.to + 1 && entry.rule === last.rule) {
      const previous = last.name.match(/^(.*?)(\d+)$/);
      const current = entry.name.match(/^(.*?)(\d+)$/);
      const consecutive =
        previous &&
        current &&
        previous[1] === current[1] &&
        Number(current[2]) === Number(previous[2]) + 1;
      if (consecutive) {
        last.to = entry.cp;
        if (!last.name.includes('{n}')) last.name = `${previous[1]}{n}`;
        continue;
      }
    }
    out.push({ from: entry.cp, to: entry.cp, rule: entry.rule, name: entry.name });
  }

  return out;
}

function emit(ranges, spaces, dashes, counts) {
  const lines = [];
  for (const range of ranges) {
    const name = range.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const to = range.to === range.from ? range.from : range.to;
    lines.push(
      `  { from: 0x${range.from.toString(16).toUpperCase().padStart(4, '0')}, to: 0x${to
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')}, rule: '${range.rule}', name: '${name}' },`,
    );
  }

  const spaceLines = spaces
    .map(
      (space) =>
        `  { cp: 0x${space.cp.toString(16).toUpperCase().padStart(4, '0')}, name: '${escape(
          space.name,
        )}' },`,
    )
    .join('\n');

  const dashLines = dashes
    .map(
      (dash) =>
        `  { cp: 0x${dash.cp.toString(16).toUpperCase().padStart(4, '0')}, name: '${escape(
          dash.name,
        )}' },`,
    )
    .join('\n');

  return `/**
 * GENERATED FILE — do not edit by hand.
 * Source: Unicode Character Database ${VERSION}
 * Regenerate: node scripts/gen-unicode.mjs
 */

export const UNICODE_VERSION = '${VERSION}';

export const COUNTS = ${JSON.stringify(counts, null, 2)};

/** Invisible format characters and default-ignorable code points. */
export const HAZARD_RANGES = [
${lines.join('\n')}
];

/** Space separators other than U+0020. */
export const SPACES = [
${spaceLines}
];

/** Code points carrying the Unicode Dash property. */
export const DASHES = [
${dashLines}
];
`;
}

async function build() {
  const [unicodeDataText, derivedText, propListText] = await Promise.all([
    fetchText('UnicodeData.txt'),
    fetchText('DerivedCoreProperties.txt'),
    fetchText('PropList.txt'),
  ]);

  const entries = parseUnicodeData(unicodeDataText);
  const ignorable = parsePropertyRanges(derivedText, 'Default_Ignorable_Code_Point');
  const dashRanges = parsePropertyRanges(propListText, 'Dash');

  const hazards = [];
  for (const [cp, entry] of entries) {
    const isFormat = entry.generalCategory === 'Cf';
    if (!isFormat && !inRanges(cp, ignorable)) continue;
    hazards.push({
      cp,
      name: entry.name,
      rule: inRanges(cp, BIDI) ? 'bidi' : 'zeroWidth',
    });
  }

  const spaces = [];
  for (const [cp, entry] of entries) {
    if (entry.generalCategory === 'Zs' && cp !== 0x20) {
      spaces.push({ cp, name: entry.name });
    }
  }

  const dashes = [];
  for (const [cp, entry] of entries) {
    if (inRanges(cp, dashRanges)) dashes.push({ cp, name: entry.name });
  }

  const counts = {
    defaultIgnorableAssigned: hazards.length,
    format: [...entries.values()].filter((e) => e.generalCategory === 'Cf').length,
    spaces: spaces.length,
    dashes: dashes.length,
  };

  const output = emit(compress(hazards), spaces, dashes, counts);

  if (process.argv.includes('--check')) {
    const current = await readFile(OUT, 'utf8').catch(() => '');
    if (current !== output) {
      console.error('unicodeHazards.generated.js is stale. Run: node scripts/gen-unicode.mjs');
      process.exit(1);
    }
    console.log('Unicode tables up to date.');
    return;
  }

  await writeFile(OUT, output, 'utf8');
  console.log(`Wrote ${OUT}`);
  console.log(counts);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
