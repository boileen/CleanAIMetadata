/**
 * JPEG metadata writer.
 *
 * Keeps the compressed scan untouched and only replaces the APP1 (EXIF/XMP)
 * and APP13 (IPTC) segments. APP0/JFIF and APP2 (including the ICC colour
 * profile) are copied through unchanged.
 */

import {
  asciiBytes,
  concatBytes,
  u16be,
  u32be,
  padEven,
} from './binary';
import { buildExifTiff, hasExifValues } from './exif';
import { buildIptcApp13, hasIptcValues } from './iptc';
import { buildXmpPacket, hasXmpValues } from './xmp';

const EXIF_PREFIX = 'Exif\0\0';
const XMP_PREFIX = 'http://ns.adobe.com/xap/1.0/\0';
const XMP_EXTENSION_PREFIX = 'http://ns.adobe.com/xmp/extension/\0';
const PHOTOSHOP_PREFIX = 'Photoshop 3.0\0';

function startsWithBytes(bytes, start, text) {
  if (start + text.length > bytes.length) return false;
  for (let i = 0; i < text.length; i += 1) {
    if (bytes[start + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

function parseSegments(bytes) {
  const segments = [];
  let offset = 2;
  let scanStart = bytes.length;

  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) break;

    const markerStart = offset;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;

    const marker = bytes[offset];
    offset += 1;

    if (marker === 0x00) continue;

    if (marker === 0xda) {
      scanStart = markerStart;
      break;
    }

    if (marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      segments.push({ marker, start: markerStart, end: offset });
      continue;
    }

    if (offset + 1 >= bytes.length) break;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2) break;
    const end = offset + length;
    if (end > bytes.length) break;

    segments.push({
      marker,
      start: markerStart,
      end,
      payloadStart: offset + 2,
      payloadEnd: end,
    });
    offset = end;
  }

  return { segments, scanStart };
}

function buildSegment(marker, payload) {
  return concatBytes([
    new Uint8Array([0xff, marker]),
    u16be(payload.length + 2),
    payload,
  ]);
}

/** Remove the IPTC 0x0404 resource while keeping any other Photoshop blocks. */
function filterPhotoshopApp13(bytes, segment) {
  const payload = bytes.subarray(segment.payloadStart, segment.payloadEnd);
  if (payload.length < 14 || !startsWithBytes(payload, 0, PHOTOSHOP_PREFIX)) {
    return payload;
  }

  const blocks = [];
  let offset = PHOTOSHOP_PREFIX.length;

  while (offset + 12 <= payload.length) {
    if (!startsWithBytes(payload, offset, '8BIM')) break;

    const id = (payload[offset + 4] << 8) | payload[offset + 5];
    let nameLength = payload[offset + 6];
    let blockOffset = offset + 7 + nameLength;
    if ((1 + nameLength) % 2 !== 0) blockOffset += 1;
    if (blockOffset + 4 > payload.length) break;

    const size =
      ((payload[blockOffset] << 24) |
        (payload[blockOffset + 1] << 16) |
        (payload[blockOffset + 2] << 8) |
        payload[blockOffset + 3]) >>> 0;
    const dataStart = blockOffset + 4;
    const dataEnd = dataStart + size;
    if (dataEnd > payload.length) break;

    const paddedEnd = dataEnd + (size % 2);
    if (id !== 0x0404) {
      blocks.push(payload.subarray(offset, paddedEnd));
    }
    offset = paddedEnd;
  }

  if (!blocks.length) return null;
  return concatBytes([asciiBytes(PHOTOSHOP_PREFIX), ...blocks]);
}

function buildMetadataSegments(values) {
  const segments = [];

  if (hasExifValues(values)) {
    const tiff = buildExifTiff(values);
    const payload = concatBytes([asciiBytes(EXIF_PREFIX), tiff]);
    if (payload.length + 2 > 0xffff) {
      throw new Error('The EXIF metadata is too large to fit in a JPEG segment.');
    }
    segments.push(buildSegment(0xe1, payload));
  }

  const xmpPacket = hasXmpValues(values) ? buildXmpPacket(values) : '';
  if (xmpPacket) {
    const payload = concatBytes([asciiBytes(XMP_PREFIX), new TextEncoder().encode(xmpPacket)]);
    if (payload.length + 2 > 0xffff) {
      throw new Error('The XMP metadata is too large to fit in a JPEG segment.');
    }
    segments.push(buildSegment(0xe1, payload));
  }

  if (hasIptcValues(values)) {
    const payload = buildIptcApp13(values);
    if (payload.length + 2 > 0xffff) {
      throw new Error('The IPTC metadata is too large to fit in a JPEG segment.');
    }
    segments.push(buildSegment(0xed, payload));
  }

  return segments;
}

/**
 * @param {ArrayBuffer|Uint8Array} arrayBuffer
 * @param {Record<string, unknown>} values
 * @returns {Uint8Array}
 */
export function writeJpegMetadata(arrayBuffer, values = {}) {
  const bytes =
    arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);

  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Not a valid JPEG file.');
  }

  const { segments, scanStart } = parseSegments(bytes);
  const kept = [];

  for (const segment of segments) {
    if (segment.marker === 0xe1 && segment.payloadStart !== undefined) {
      if (startsWithBytes(bytes, segment.payloadStart, EXIF_PREFIX)) continue;
      if (startsWithBytes(bytes, segment.payloadStart, XMP_PREFIX)) continue;
      if (startsWithBytes(bytes, segment.payloadStart, XMP_EXTENSION_PREFIX)) continue;
    }

    if (segment.marker === 0xed && segment.payloadStart !== undefined) {
      const filtered = filterPhotoshopApp13(bytes, segment);
      if (filtered === null) continue;
      kept.push({ marker: 0xed, bytes: buildSegment(0xed, filtered) });
      continue;
    }

    kept.push({ marker: segment.marker, bytes: bytes.subarray(segment.start, segment.end) });
  }

  const newSegments = buildMetadataSegments(values);

  // Insert after JFIF/APP0 when present; otherwise directly after SOI.
  let insertIndex = 0;
  for (let i = 0; i < kept.length; i += 1) {
    if (kept[i].marker === 0xe0) insertIndex = i + 1;
  }

  const output = [
    bytes.subarray(0, 2),
    ...kept.slice(0, insertIndex).map((entry) => entry.bytes),
    ...newSegments,
    ...kept.slice(insertIndex).map((entry) => entry.bytes),
  ];

  if (scanStart < bytes.length) {
    output.push(bytes.subarray(scanStart));
  }

  return concatBytes(output);
}
