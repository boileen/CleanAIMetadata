/**
 * WebP metadata writer.
 *
 * Rebuilds the RIFF container, updates the VP8X feature flags and writes the
 * EXIF/XMP chunks. ICC, alpha, animation and image chunks are copied through.
 */

import { asciiBytes, concatBytes, u32le } from './binary';
import { buildExifTiff, hasExifValues } from './exif';
import { buildXmpPacket, hasXmpValues } from './xmp';

const VP8X_FLAG_ICC = 0x20;
const VP8X_FLAG_ALPHA = 0x10;
const VP8X_FLAG_EXIF = 0x08;
const VP8X_FLAG_XMP = 0x04;
const VP8X_FLAG_ANIMATION = 0x02;

function readChunks(bytes) {
  const chunks = [];
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const fourcc = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    const size =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>> 0;
    const dataStart = offset + 8;
    const dataEnd = dataStart + size;
    const paddedEnd = dataEnd + (size & 1);
    if (paddedEnd > bytes.length) break;
    chunks.push({
      fourcc,
      data: bytes.subarray(dataStart, dataEnd),
      start: offset,
      end: paddedEnd,
    });
    offset = paddedEnd;
  }

  return chunks;
}

function read24le(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function write24le(value) {
  return new Uint8Array([value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff]);
}

function getDimensions(chunks) {
  const vp8x = chunks.find((chunk) => chunk.fourcc === 'VP8X');
  if (vp8x && vp8x.data.length >= 10) {
    return {
      width: read24le(vp8x.data, 4) + 1,
      height: read24le(vp8x.data, 7) + 1,
      flags: vp8x.data[0],
    };
  }

  const vp8 = chunks.find((chunk) => chunk.fourcc === 'VP8 ');
  if (vp8 && vp8.data.length >= 10) {
    return {
      width: vp8.data[6] | ((vp8.data[7] & 0x3f) << 8),
      height: vp8.data[8] | ((vp8.data[9] & 0x3f) << 8),
      flags: 0,
    };
  }

  const vp8l = chunks.find((chunk) => chunk.fourcc === 'VP8L');
  if (vp8l && vp8l.data.length >= 5) {
    const bits =
      vp8l.data[1] |
      (vp8l.data[2] << 8) |
      (vp8l.data[3] << 16) |
      (vp8l.data[4] << 24);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >>> 14) & 0x3fff) + 1,
      flags: 0,
    };
  }

  return { width: 1, height: 1, flags: 0 };
}

function buildVp8x(flags, width, height) {
  return concatBytes([
    new Uint8Array([flags, 0, 0, 0]),
    write24le(Math.max(0, width - 1)),
    write24le(Math.max(0, height - 1)),
  ]);
}

function buildChunk(fourcc, data) {
  return concatBytes([
    asciiBytes(fourcc),
    u32le(data.length),
    data,
    data.length % 2 ? new Uint8Array([0]) : new Uint8Array(0),
  ]);
}

/**
 * @param {ArrayBuffer|Uint8Array} arrayBuffer
 * @param {Record<string, unknown>} values
 * @returns {Uint8Array}
 */
export function writeWebpMetadata(arrayBuffer, values = {}) {
  const bytes =
    arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);

  if (
    !(bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) ||
    !(bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
  ) {
    throw new Error('Not a valid WebP file.');
  }

  const chunks = readChunks(bytes);
  const { width, height, flags: originalFlags } = getDimensions(chunks);

  const exif = hasExifValues(values) ? buildExifTiff(values) : null;
  const xmp = hasXmpValues(values) ? new TextEncoder().encode(buildXmpPacket(values)) : null;

  let flags = originalFlags;
  if (exif) flags |= VP8X_FLAG_EXIF;
  else flags &= ~VP8X_FLAG_EXIF;
  if (xmp) flags |= VP8X_FLAG_XMP;
  else flags &= ~VP8X_FLAG_XMP;

  // Keep the ICC flag accurate when an ICC profile chunk is present.
  if (chunks.some((chunk) => chunk.fourcc === 'ICCP')) flags |= VP8X_FLAG_ICC;

  // Preserve alpha/animation flags already present in the VP8X header.
  if (!chunks.some((chunk) => chunk.fourcc === 'VP8X')) {
    if (chunks.some((chunk) => chunk.fourcc === 'ALPH')) flags |= VP8X_FLAG_ALPHA;
    if (chunks.some((chunk) => chunk.fourcc === 'ANIM' || chunk.fourcc === 'ANMF')) {
      flags |= VP8X_FLAG_ANIMATION;
    }
  }

  const outputChunks = [];

  // VP8X must be the first chunk when present.
  const needsVp8x =
    exif || xmp || chunks.some((chunk) => chunk.fourcc === 'VP8X') ||
    (flags & (VP8X_FLAG_ICC | VP8X_FLAG_ALPHA | VP8X_FLAG_ANIMATION));
  if (needsVp8x) {
    outputChunks.push(buildChunk('VP8X', buildVp8x(flags, width, height)));
  }

  for (const chunk of chunks) {
    if (chunk.fourcc === 'VP8X') continue;
    if (chunk.fourcc === 'EXIF' || chunk.fourcc === 'XMP ') continue;
    outputChunks.push(bytes.subarray(chunk.start, chunk.end));
  }

  if (exif) outputChunks.push(buildChunk('EXIF', exif));
  if (xmp) outputChunks.push(buildChunk('XMP ', xmp));

  const body = concatBytes(outputChunks);
  const totalSize = 12 + body.length;
  const header = new Uint8Array(12);
  header.set(asciiBytes('RIFF'), 0);
  const riffSize = totalSize - 8;
  header.set(u32le(riffSize), 4);
  header.set(asciiBytes('WEBP'), 8);

  return concatBytes([header, body]);
}
