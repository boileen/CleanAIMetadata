/**
 * Lossless metadata stripper.
 *
 * Works directly on the compressed byte stream — pixels are never decoded or
 * re-encoded, so image quality is preserved exactly. Metadata carriers are
 * removed by walking the container structure and skipping the relevant
 * segments/chunks:
 *
 *   JPEG  → APP1 (EXIF/XMP), APP2 (C2PA/JUMBF), APP13 (IPTC), COM, other APPn
 *           (ICC colour profile and APP0/JFIF are preserved)
 *   PNG   → tEXt, zTXt, iTXt, eXIf, tIME (critical + colour chunks preserved)
 *   WebP  → EXIF, XMP, C2PA sub-chunks (image/colour/animation chunks preserved)
 *
 * TIFF / HEIC / AVIF cannot be stripped losslessly in pure JS, so they fall
 * back to a canvas re-encode (lossy) when the browser can decode them.
 */

import { LOSSLESS_FORMATS } from './fileValidation';

function concatBytes(chunks) {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function hasAsciiSignature(bytes, start, signature) {
  if (start + signature.length > bytes.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[start + i] !== signature.charCodeAt(i)) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ JPEG */

function shouldKeepJpegSegment(marker, bytes, payloadStart) {
  // APP0 (JFIF/JFXX) — DPI/aspect info, no private data.
  if (marker === 0xe0) return true;
  // APP2 — keep ONLY the ICC colour profile for colour fidelity.
  if (marker === 0xe2) return hasAsciiSignature(bytes, payloadStart, 'ICC_PROFILE');
  // All other APPn — EXIF, XMP, C2PA/JUMBF, IPTC/Photoshop, etc.
  if (marker >= 0xe1 && marker <= 0xef) return false;
  // Comment segment.
  if (marker === 0xfe) return false;
  // Structural segments (DQT, DHT, SOF, DRI, ...) are preserved.
  return true;
}

function stripJpeg(arrayBuffer, onProgress) {
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Not a valid JPEG file.');
  }

  const output = [bytes.subarray(0, 2)]; // SOI
  let offset = 2;
  let removedSegments = 0;
  const total = bytes.length;

  while (offset < total) {
    if (bytes[offset] !== 0xff) {
      // Malformed marker stream — copy the remainder untouched.
      output.push(bytes.subarray(offset));
      break;
    }

    const markerStart = offset;
    while (offset < total && bytes[offset] === 0xff) offset += 1;
    if (offset >= total) break;
    const marker = bytes[offset];
    offset += 1;

    // Standalone markers without a length field.
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      output.push(bytes.subarray(markerStart, offset));
      if (marker === 0xd9) break;
      continue;
    }

    // Start of scan — copy everything from here (scan header + pixel data + EOI).
    if (marker === 0xda) {
      output.push(bytes.subarray(markerStart));
      break;
    }

    if (offset + 1 >= total) break;
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2) break;
    const segmentEnd = Math.min(offset + segmentLength, total);

    if (shouldKeepJpegSegment(marker, bytes, offset + 2)) {
      output.push(bytes.subarray(markerStart, segmentEnd));
    } else {
      removedSegments += 1;
    }

    offset = segmentEnd;
    if (onProgress && removedSegments % 3 === 0) {
      onProgress(Math.min(99, Math.round((offset / total) * 100)));
    }
  }

  if (onProgress) onProgress(100);
  return { bytes: concatBytes(output), removedSegments };
}

/* ------------------------------------------------------------------- PNG */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Critical chunks + colour chunks + APNG animation chunks are preserved.
const PNG_KEEP_CHUNKS = new Set([
  'IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS',
  'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'pHYs',
  'acTL', 'fcTL', 'fdAT',
  'cICP', 'mDCv', 'cLLi',
]);

function stripPng(arrayBuffer, onProgress) {
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
    if (bytes[i] !== PNG_SIGNATURE[i]) throw new Error('Not a valid PNG file.');
  }

  const output = [bytes.subarray(0, 8)];
  let offset = 8;
  let removedSegments = 0;
  const total = bytes.length;

  while (offset + 8 <= total) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
    const length = view.getUint32(0, false);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > total) break;

    if (PNG_KEEP_CHUNKS.has(type)) {
      output.push(bytes.subarray(offset, chunkEnd));
    } else {
      removedSegments += 1;
    }

    offset = chunkEnd;
    if (onProgress) onProgress(Math.min(99, Math.round((offset / total) * 100)));
    if (type === 'IEND') break;
  }

  if (onProgress) onProgress(100);
  return { bytes: concatBytes(output), removedSegments };
}

/* ------------------------------------------------------------------ WebP */

const WEBP_KEEP_CHUNKS = new Set([
  'VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF', 'ICCP',
]);

function stripWebp(arrayBuffer, onProgress) {
  const bytes = new Uint8Array(arrayBuffer);
  if (
    !(bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) ||
    !(bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
  ) {
    throw new Error('Not a valid WebP file.');
  }

  const chunks = [];
  let offset = 12;
  let removedSegments = 0;

  while (offset + 8 <= bytes.length) {
    const fourcc = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    const size =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>> 0;
    const dataEnd = offset + 8 + size;
    const paddedEnd = dataEnd + (size & 1);
    if (paddedEnd > bytes.length) break;

    if (WEBP_KEEP_CHUNKS.has(fourcc)) {
      chunks.push(bytes.subarray(offset, paddedEnd));
    } else {
      removedSegments += 1;
    }

    offset = paddedEnd;
    if (onProgress) onProgress(Math.min(99, Math.round((offset / bytes.length) * 100)));
  }

  const body = concatBytes(chunks);
  const totalSize = 12 + body.length;
  const header = new Uint8Array(12);
  header.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  const riffSize = totalSize - 8;
  header[4] = riffSize & 0xff;
  header[5] = (riffSize >> 8) & 0xff;
  header[6] = (riffSize >> 16) & 0xff;
  header[7] = (riffSize >> 24) & 0xff;
  header.set([0x57, 0x45, 0x42, 0x50], 8); // "WEBP"

  if (onProgress) onProgress(100);
  return { bytes: concatBytes([header, body]), removedSegments };
}

/* ------------------------------------------------------ canvas fallback */

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode failed'));
    img.src = url;
  });
}

async function stripViaCanvas(blob, format, onProgress) {
  if (onProgress) onProgress(20);
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    if (onProgress) onProgress(50);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser.');
    ctx.drawImage(img, 0, 0);
    if (onProgress) onProgress(75);

    const outBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode image.'))),
        'image/png',
      );
    });

    if (onProgress) onProgress(100);
    return { blob: outBlob, removedSegments: 0, lossless: false };
  } catch (err) {
    throw new Error(
      `${format.toUpperCase()} could not be decoded by this browser. ` +
        'Use JPEG, PNG, or WebP for lossless cleaning.',
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* --------------------------------------------------------------- public */

function mimeForFormat(format) {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  if (format === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

/**
 * Remove metadata from an image.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @param {string} format  detected format ('jpeg' | 'png' | 'webp' | 'tiff' | 'heic' | 'avif')
 * @param {(percent:number)=>void} [onProgress]
 * @returns {Promise<{blob: Blob, lossless: boolean, removedSegments: number, outputExtension: string}>}
 */
export async function stripMetadata(arrayBuffer, format, onProgress) {
  if (LOSSLESS_FORMATS.has(format)) {
    let result;
    if (format === 'jpeg') result = stripJpeg(arrayBuffer, onProgress);
    else if (format === 'png') result = stripPng(arrayBuffer, onProgress);
    else result = stripWebp(arrayBuffer, onProgress);

    const blob = new Blob([result.bytes], { type: mimeForFormat(format) });
    return {
      blob,
      lossless: true,
      removedSegments: result.removedSegments,
      outputExtension: format === 'jpeg' ? 'jpg' : format,
    };
  }

  const sourceBlob = new Blob([arrayBuffer]);
  const result = await stripViaCanvas(sourceBlob, format, onProgress);
  return { ...result, outputExtension: 'png' };
}
