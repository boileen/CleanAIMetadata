/**
 * Magic-byte image format detection.
 *
 * We never trust the file extension or MIME type reported by the browser/OS.
 * Instead we inspect the first bytes of the actual binary payload.
 */

const HEIF_BRANDS = new Set([
  'heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1',
]);
const AVIF_BRANDS = new Set(['avif', 'avis']);

/**
 * Detect the real image container format from an ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {'jpeg'|'png'|'webp'|'tiff'|'heic'|'avif'}
 * @throws {Error} when the bytes do not match any supported format
 */
export function detectFormat(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength < 12) {
    throw new Error('File is too small to be a valid image.');
  }

  const b = new Uint8Array(arrayBuffer, 0, Math.min(arrayBuffer.byteLength, 32));

  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'webp';
  }

  // TIFF: "II*\0" (little-endian) or "MM\0*" (big-endian)
  if (
    (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
    (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)
  ) {
    return 'tiff';
  }

  // HEIF / AVIF: box size (4 bytes) + "ftyp" + brand (4 bytes)
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]).toLowerCase();
    if (AVIF_BRANDS.has(brand)) return 'avif';
    if (HEIF_BRANDS.has(brand)) return 'heic';
  }

  throw new Error('Unsupported or corrupt image format.');
}

/**
 * Human-friendly label for a detected format.
 * @param {string} format
 */
export function formatLabel(format) {
  const labels = {
    jpeg: 'JPEG',
    png: 'PNG',
    webp: 'WebP',
    tiff: 'TIFF',
    heic: 'HEIC',
    avif: 'AVIF',
  };
  return labels[format] || (format ? format.toUpperCase() : 'IMAGE');
}

/**
 * Formats that can be stripped losslessly in pure JS (no pixel re-encode).
 */
export const LOSSLESS_FORMATS = new Set(['jpeg', 'png', 'webp']);
