/**
 * Minimal EXIF / TIFF writer.
 *
 * Builds a little-endian TIFF structure with IFD0, an Exif sub-IFD and an
 * optional GPS sub-IFD. Only the fields supplied by the editor are written;
 * image pixel data never passes through this module.
 */

import {
  asciiBytes,
  utf8Bytes,
  u16le,
  u32le,
  concatBytes,
} from './binary';

const TYPE = {
  BYTE: 1,
  ASCII: 2,
  SHORT: 3,
  LONG: 4,
  RATIONAL: 5,
  UNDEFINED: 7,
  SRATIONAL: 10,
};

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

/** Turn "1/125", "2.8" or "0.5" into a [numerator, denominator] pair. */
export function toFraction(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  if (!text) return null;

  if (text.includes('/')) {
    const [rawNum, rawDen] = text.split('/');
    const num = Number(rawNum);
    const den = Number(rawDen);
    if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return [Math.round(num), Math.round(den)];
    }
    return null;
  }

  const num = Number(text);
  if (!Number.isFinite(num)) return null;
  if (Number.isInteger(num)) return [num, 1];

  let den = 1_000_000;
  let n = Math.round(num * den);
  const divisor = gcd(n, den);
  n /= divisor;
  den /= divisor;
  return [n, den];
}

function rationalBytes(value) {
  const fraction = toFraction(value);
  if (!fraction) return null;
  return concatBytes([u32le(fraction[0]), u32le(fraction[1])]);
}

function sRationalBytes(value) {
  const fraction = toFraction(value);
  if (!fraction) return null;
  const [num, den] = fraction;
  const writeSigned = (n) => {
    const v = n < 0 ? (0x100000000 + n) : n;
    return u32le(v >>> 0);
  };
  return concatBytes([writeSigned(num), u32le(den)]);
}

function asciiEntry(tag, value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const bytes = concatBytes([utf8Bytes(String(value)), new Uint8Array([0])]);
  return { tag, type: TYPE.ASCII, count: bytes.length, valueBytes: bytes };
}

function undefinedEntry(tag, bytes) {
  return { tag, type: TYPE.UNDEFINED, count: bytes.length, valueBytes: bytes };
}

function shortEntry(tag, value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return null;
  return { tag, type: TYPE.SHORT, count: 1, valueBytes: u16le(num & 0xffff) };
}

function rationalEntry(tag, value) {
  const bytes = rationalBytes(value);
  if (!bytes) return null;
  return { tag, type: TYPE.RATIONAL, count: 1, valueBytes: bytes };
}

function sRationalEntry(tag, value) {
  const bytes = sRationalBytes(value);
  if (!bytes) return null;
  return { tag, type: TYPE.SRATIONAL, count: 1, valueBytes: bytes };
}

function longEntry(tag, value) {
  return { tag, type: TYPE.LONG, count: 1, valueBytes: u32le(value) };
}

function push(entries, entry) {
  if (entry) entries.push(entry);
}

/** EXIF stores dates as "YYYY:MM:DD HH:MM:SS". */
export function toExifDate(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${value.getFullYear()}:${pad(value.getMonth() + 1)}:${pad(value.getDate())} ${pad(
      value.getHours(),
    )}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
  }

  const text = String(value).trim();
  if (/^\d{4}:\d{2}:\d{2}/.test(text)) {
    return text.length === 10 ? `${text} 00:00:00` : text;
  }

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (match) {
    return `${match[1]}:${match[2]}:${match[3]} ${match[4] || '00'}:${match[5] || '00'}:${
      match[6] || '00'
    }`;
  }

  return text;
}

function decimalToDms(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const absolute = Math.abs(number);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 10000) / 10000;
  return { degrees, minutes, seconds, negative: number < 0 };
}

function dmsRationalEntry(tag, dms) {
  const secondsScaled = Math.round(dms.seconds * 10000);
  return {
    tag,
    type: TYPE.RATIONAL,
    count: 3,
    valueBytes: concatBytes([
      u32le(dms.degrees),
      u32le(1),
      u32le(dms.minutes),
      u32le(1),
      u32le(secondsScaled),
      u32le(10000),
    ]),
  };
}

function buildIfd(entries, tableOffset) {
  const count = entries.length;
  const tableSize = 2 + count * 12 + 4;
  let dataOffset = tableOffset + tableSize;
  const table = new Uint8Array(tableSize);
  const view = new DataView(table.buffer);
  const dataParts = [];

  view.setUint16(0, count, true);

  entries.forEach((entry, index) => {
    const entryOffset = 2 + index * 12;
    view.setUint16(entryOffset, entry.tag, true);
    view.setUint16(entryOffset + 2, entry.type, true);
    view.setUint32(entryOffset + 4, entry.count, true);

    if (entry.valueBytes.length <= 4) {
      table.set(entry.valueBytes, entryOffset + 8);
    } else {
      view.setUint32(entryOffset + 8, dataOffset, true);
      dataParts.push(entry.valueBytes);
      dataOffset += entry.valueBytes.length;
    }
  });

  view.setUint32(2 + count * 12, 0, true);
  return { table, data: concatBytes(dataParts) };
}

function measureIfd(entries) {
  const tableSize = 2 + entries.length * 12 + 4;
  const dataSize = entries.reduce(
    (sum, entry) => sum + (entry.valueBytes.length > 4 ? entry.valueBytes.length : 0),
    0,
  );
  return { tableSize, dataSize };
}

function buildIfd0Entries(values) {
  const entries = [];
  push(entries, asciiEntry(0x010e, values.imageDescription));
  push(entries, asciiEntry(0x010f, values.make));
  push(entries, asciiEntry(0x0110, values.model));
  push(entries, shortEntry(0x0112, values.orientation));
  push(entries, asciiEntry(0x0131, values.software));
  push(entries, asciiEntry(0x0132, toExifDate(values.modifyDate)));
  push(entries, asciiEntry(0x013b, values.artist));
  push(entries, asciiEntry(0x8298, values.copyright));

  // Baseline resolution tags keep files friendly to older viewers.
  entries.push({
    tag: 0x011a,
    type: TYPE.RATIONAL,
    count: 1,
    valueBytes: concatBytes([u32le(72), u32le(1)]),
  });
  entries.push({
    tag: 0x011b,
    type: TYPE.RATIONAL,
    count: 1,
    valueBytes: concatBytes([u32le(72), u32le(1)]),
  });
  push(entries, shortEntry(0x0128, 2)); // ResolutionUnit: inches
  push(entries, shortEntry(0x0213, 1)); // YCbCrPositioning: centered

  return entries;
}

function buildExifEntries(values) {
  const entries = [];

  // ExifVersion 2.32
  entries.push({
    tag: 0x9000,
    type: TYPE.UNDEFINED,
    count: 4,
    valueBytes: asciiBytes('0232'),
  });

  push(entries, rationalEntry(0x829a, values.exposureTime));
  push(entries, rationalEntry(0x829d, values.fNumber));
  push(entries, shortEntry(0x8822, values.exposureProgram));
  push(entries, shortEntry(0x8827, values.iso));
  push(entries, asciiEntry(0x9003, toExifDate(values.dateTimeOriginal)));
  push(entries, asciiEntry(0x9004, toExifDate(values.createDate)));
  push(entries, sRationalEntry(0x9204, values.exposureCompensation));
  push(entries, shortEntry(0x9207, values.meteringMode));
  push(entries, shortEntry(0x9209, values.flash));
  push(entries, rationalEntry(0x920a, values.focalLength));

  if (values.userComment) {
    push(
      entries,
      undefinedEntry(
        0x9286,
        concatBytes([asciiBytes('ASCII\0\0\0'), utf8Bytes(values.userComment)]),
      ),
    );
  }

  push(entries, shortEntry(0xa001, values.colorSpace));
  push(entries, shortEntry(0xa403, values.whiteBalance));
  push(entries, shortEntry(0xa405, values.focalLength35mm));
  push(entries, asciiEntry(0xa431, values.serialNumber));
  push(entries, asciiEntry(0xa433, values.lensMake));
  push(entries, asciiEntry(0xa434, values.lensModel));

  return entries;
}

function hasVal(v) {
  return v !== null && v !== undefined && String(v).trim() !== '';
}

/** Convert a "HH:MM:SS" or "HH:MM" string to three RATIONAL values (h, m, s). */
function timeToRationals(timeStr) {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':').map(Number);
  if (parts.length < 2 || parts.some((p) => !Number.isFinite(p))) return null;
  const [h, m, s = 0] = parts;
  return { h, m, s };
}

function gpsTimeEntry(tag, timeStr) {
  const t = timeToRationals(timeStr);
  if (!t) return null;
  return {
    tag,
    type: TYPE.RATIONAL,
    count: 3,
    valueBytes: concatBytes([
      u32le(t.h), u32le(1),
      u32le(t.m), u32le(1),
      u32le(Math.round(t.s * 100)), u32le(100),
    ]),
  };
}

/** Convert ISO date "YYYY-MM-DD" to GPS datestamp "YYYY:MM:DD". */
function toGpsDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  // already in YYYY:MM:DD
  if (/^\d{4}:\d{2}:\d{2}$/.test(s)) return s;
  // ISO YYYY-MM-DD
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}:${m[2]}:${m[3]}`;
  return null;
}

function buildGpsEntries(values) {
  const latitude = decimalToDms(values.gpsLatitude);
  const longitude = decimalToDms(values.gpsLongitude);
  const entries = [];

  // GPS version tag (required by spec)
  entries.push({
    tag: 0x0000,
    type: TYPE.BYTE,
    count: 4,
    valueBytes: new Uint8Array([2, 3, 0, 0]),
  });

  if (latitude) {
    entries.push(asciiEntry(0x0001, latitude.negative ? 'S' : 'N'));
    entries.push(dmsRationalEntry(0x0002, latitude));
  }
  if (longitude) {
    entries.push(asciiEntry(0x0003, longitude.negative ? 'W' : 'E'));
    entries.push(dmsRationalEntry(0x0004, longitude));
  }

  if (hasVal(values.gpsAltitude)) {
    const altitude = Number(values.gpsAltitude);
    if (Number.isFinite(altitude)) {
      // 0x0005 AltitudeRef: 0 = above, 1 = below
      const ref = values.gpsAltitudeRef === 'below' ? 1 : 0;
      entries.push({
        tag: 0x0005,
        type: TYPE.BYTE,
        count: 1,
        valueBytes: new Uint8Array([ref]),
      });
      entries.push(rationalEntry(0x0006, Math.abs(altitude).toString()));
    }
  }

  // 0x0007 GPSTimeStamp (HH:MM:SS as 3 rationals)
  if (hasVal(values.gpsTime)) {
    entries.push(gpsTimeEntry(0x0007, values.gpsTime));
  }

  // 0x000D GPSSpeed (rational)
  if (hasVal(values.gpsSpeed)) {
    const spd = Number(values.gpsSpeed);
    if (Number.isFinite(spd) && spd >= 0) {
      // 0x000C GPSSpeedRef: K = km/h, M = mph, N = knots
      entries.push(asciiEntry(0x000c, values.gpsSpeedUnit || 'K'));
      entries.push(rationalEntry(0x000d, spd.toString()));
    }
  }

  // 0x0011 GPSImgDirection (rational)
  if (hasVal(values.gpsDirection)) {
    const dir = Number(values.gpsDirection);
    if (Number.isFinite(dir) && dir >= 0 && dir <= 360) {
      // 0x0010 GPSImgDirectionRef: T = true north, M = magnetic
      entries.push(asciiEntry(0x0010, values.gpsDirectionRef === 'magnetic' ? 'M' : 'T'));
      entries.push(rationalEntry(0x0011, dir.toString()));
    }
  }

  // 0x001D GPSDateStamp (ASCII "YYYY:MM:DD")
  if (hasVal(values.gpsDate)) {
    const dateStr = toGpsDate(values.gpsDate);
    if (dateStr) entries.push(asciiEntry(0x001d, dateStr));
  }

  return entries.filter(Boolean);
}

/**
 * Build a complete TIFF byte stream (without the JPEG "Exif\0\0" prefix).
 * @param {Record<string, unknown>} values
 * @returns {Uint8Array}
 */
export function buildExifTiff(values = {}) {
  const ifd0Base = buildIfd0Entries(values);
  const exifEntries = buildExifEntries(values);
  const gpsEntries = buildGpsEntries(values);

  const hasExif = exifEntries.length > 0;
  const hasGps = gpsEntries.length > 0;

  const ifd0Count = ifd0Base.length + (hasExif ? 1 : 0) + (hasGps ? 1 : 0);
  const ifd0Measure = measureIfd(
    ifd0Base.concat(
      hasExif ? [longEntry(0x8769, 0)] : [],
      hasGps ? [longEntry(0x8825, 0)] : [],
    ),
  );

  const ifd0TableSize = 2 + ifd0Count * 12 + 4;
  const exifOffset = 8 + ifd0TableSize + ifd0Measure.dataSize;
  const exifMeasure = measureIfd(exifEntries);
  const gpsOffset = exifOffset + exifMeasure.tableSize + exifMeasure.dataSize;

  const ifd0Entries = [...ifd0Base];
  if (hasExif) ifd0Entries.push(longEntry(0x8769, exifOffset));
  if (hasGps) ifd0Entries.push(longEntry(0x8825, gpsOffset));

  const ifd0 = buildIfd(ifd0Entries, 8);
  const exif = hasExif ? buildIfd(exifEntries, exifOffset) : { table: new Uint8Array(0), data: new Uint8Array(0) };
  const gps = hasGps ? buildIfd(gpsEntries, gpsOffset) : { table: new Uint8Array(0), data: new Uint8Array(0) };

  return concatBytes([
    asciiBytes('II'),
    u16le(42),
    u32le(8),
    ifd0.table,
    ifd0.data,
    exif.table,
    exif.data,
    gps.table,
    gps.data,
  ]);
}

/** True when at least one EXIF field has a value. */
export function hasExifValues(values = {}) {
  return [
    'make', 'model', 'lensModel', 'lensMake', 'serialNumber', 'iso',
    'fNumber', 'exposureTime', 'focalLength', 'focalLength35mm',
    'exposureCompensation', 'exposureProgram', 'meteringMode', 'whiteBalance',
    'flash', 'colorSpace', 'orientation', 'dateTimeOriginal', 'createDate',
    'modifyDate', 'imageDescription', 'artist', 'copyright', 'software',
    'userComment', 'gpsLatitude', 'gpsLongitude', 'gpsAltitude',
    'gpsDirection', 'gpsSpeed', 'gpsTime', 'gpsDate',
  ].some((key) => values[key] !== undefined && values[key] !== null && String(values[key]).trim() !== '');
}
