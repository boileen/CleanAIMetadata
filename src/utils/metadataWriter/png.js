/**
 * PNG metadata writer.
 *
 * EXIF is written in a standard eXIf chunk and XMP in an iTXt chunk. PNG has
 * no official IPTC chunk, so IPTC Core values are mirrored into XMP.
 */

import {
  asciiBytes,
  concatBytes,
  u32be,
  crc32,
} from './binary';
import { buildExifTiff, hasExifValues } from './exif';
import { buildXmpPacket, hasXmpValues } from './xmp';

const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const XMP_KEYWORD = 'XML:com.adobe.xmp';

function readChunks(bytes) {
  const chunks = [];
  let offset = 8;

  while (offset + 12 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 8);
    const length = view.getUint32(0, false);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const end = dataEnd + 4;
    if (end > bytes.length) break;
    chunks.push({ type, data: bytes.subarray(dataStart, dataEnd), start: offset, end });
    offset = end;
    if (type === 'IEND') break;
  }

  return chunks;
}

function buildChunk(type, data) {
  const typeBytes = asciiBytes(type);
  const crc = crc32(concatBytes([typeBytes, data]));
  return concatBytes([u32be(data.length), typeBytes, data, u32be(crc)]);
}

function buildITxt(keyword, text) {
  return concatBytes([
    asciiBytes(keyword),
    new Uint8Array([0]), // keyword terminator
    new Uint8Array([0]), // compression flag: uncompressed
    new Uint8Array([0]), // compression method
    new Uint8Array([0]), // language tag terminator
    new Uint8Array([0]), // translated keyword terminator
    new TextEncoder().encode(text),
  ]);
}

function isXmpChunk(chunk) {
  if (chunk.type !== 'iTXt') return false;
  const prefix = asciiBytes(`${XMP_KEYWORD}\0`);
  if (chunk.data.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i += 1) {
    if (chunk.data[i] !== prefix[i]) return false;
  }
  return true;
}

/**
 * @param {ArrayBuffer|Uint8Array} arrayBuffer
 * @param {Record<string, unknown>} values
 * @returns {Uint8Array}
 */
export function writePngMetadata(arrayBuffer, values = {}) {
  const bytes =
    arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);

  for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
    if (bytes[i] !== PNG_SIGNATURE[i]) throw new Error('Not a valid PNG file.');
  }

  const chunks = readChunks(bytes);
  if (!chunks.some((chunk) => chunk.type === 'IHDR')) {
    throw new Error('The PNG file has no IHDR chunk.');
  }

  const newChunks = [];
  if (hasExifValues(values)) {
    newChunks.push(buildChunk('eXIf', buildExifTiff(values)));
  }
  if (hasXmpValues(values)) {
    newChunks.push(buildChunk('iTXt', buildITxt(XMP_KEYWORD, buildXmpPacket(values))));
  }

  const output = [PNG_SIGNATURE];

  for (const chunk of chunks) {
    if (chunk.type === 'eXIf' || isXmpChunk(chunk)) continue;

    output.push(bytes.subarray(chunk.start, chunk.end));

    if (chunk.type === 'IHDR') {
      output.push(...newChunks);
    }
  }

  return concatBytes(output);
}
