/**
 * WebP container helpers.
 *
 * exifr has no WebP container parser, so we unpack the RIFF chunks ourselves
 * and hand the raw EXIF TIFF / XMP packet back to exifr for decoding.
 */

const XMP_JPEG_HEADER = 'http://ns.adobe.com/xap/1.0/\0';

function toBytes(arrayBuffer) {
  return arrayBuffer instanceof Uint8Array
    ? arrayBuffer
    : new Uint8Array(arrayBuffer);
}

/** Read the RIFF chunk list of a WebP file. */
export function readWebpChunks(arrayBuffer) {
  const bytes = toBytes(arrayBuffer);
  if (
    bytes.length < 12 ||
    bytes[0] !== 0x52 ||
    bytes[1] !== 0x49 ||
    bytes[2] !== 0x46 ||
    bytes[3] !== 0x46 ||
    bytes[8] !== 0x57 ||
    bytes[9] !== 0x45 ||
    bytes[10] !== 0x42 ||
    bytes[11] !== 0x50
  ) {
    return [];
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [];
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const fourcc = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    const size = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = dataStart + size;
    if (dataEnd > bytes.length) break;

    chunks.push({ fourcc, data: bytes.subarray(dataStart, dataEnd), size });
    offset = dataEnd + (size & 1);
  }

  return chunks;
}

/**
 * Return the raw EXIF TIFF and XMP packet carried by a WebP file.
 * @param {ArrayBuffer|Uint8Array} arrayBuffer
 * @returns {{ exif: Uint8Array|null, xmp: string|null, iccp: boolean }}
 */
export function extractWebpMetadata(arrayBuffer) {
  const chunks = readWebpChunks(arrayBuffer);
  const exifChunk = chunks.find((chunk) => chunk.fourcc === 'EXIF');
  const xmpChunk = chunks.find((chunk) => chunk.fourcc === 'XMP ');

  let exif = exifChunk ? exifChunk.data : null;

  // Some encoders keep the JPEG "Exif\0\0" prefix inside the EXIF chunk.
  if (
    exif &&
    exif.length > 6 &&
    exif[0] === 0x45 &&
    exif[1] === 0x78 &&
    exif[2] === 0x69 &&
    exif[3] === 0x66 &&
    exif[4] === 0 &&
    exif[5] === 0
  ) {
    exif = exif.subarray(6);
  }

  let xmp = null;
  if (xmpChunk) {
    try {
      xmp = new TextDecoder('utf-8').decode(xmpChunk.data);
    } catch {
      xmp = null;
    }
  }

  return {
    exif,
    xmp,
    iccp: chunks.some((chunk) => chunk.fourcc === 'ICCP'),
  };
}

/**
 * Wrap an XMP packet in a minimal JPEG APP1 segment so exifr can parse it.
 * @param {string} xmpText
 * @returns {ArrayBuffer}
 */
export function wrapXmpAsJpeg(xmpText) {
  const header = new TextEncoder().encode(XMP_JPEG_HEADER);
  const payload = new TextEncoder().encode(xmpText);
  const segmentLength = payload.length + header.length + 2;

  // SOI (2) + APP1 marker (2) + length (2) + payload + EOI (2).
  const out = new Uint8Array(6 + header.length + payload.length + 2);
  let offset = 0;
  out[offset++] = 0xff;
  out[offset++] = 0xd8; // SOI
  out[offset++] = 0xff;
  out[offset++] = 0xe1; // APP1
  out[offset++] = (segmentLength >> 8) & 0xff;
  out[offset++] = segmentLength & 0xff;
  out.set(header, offset);
  offset += header.length;
  out.set(payload, offset);
  offset += payload.length;
  out[offset++] = 0xff;
  out[offset++] = 0xd9; // EOI

  return out.buffer;
}
