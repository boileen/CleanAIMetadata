/**
 * Metadata write orchestrator.
 *
 * Remove mode strips every metadata carrier first, then writes a fresh set of
 * fields. Preserve mode keeps the original container and replaces only the
 * EXIF/IPTC/XMP carriers handled by the editor.
 */

import { stripMetadata } from '../metadataStripper';
import { writeJpegMetadata } from './jpeg';
import { writePngMetadata } from './png';
import { writeWebpMetadata } from './webp';

const MIME = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export function getFormatMime(format) {
  return MIME[format] || 'application/octet-stream';
}

function pause() {
  return new Promise((resolve) => setTimeout(resolve, 24));
}

/**
 * @param {ArrayBuffer} arrayBuffer
 * @param {'jpeg'|'png'|'webp'} format
 * @param {'remove'|'preserve'} mode
 * @param {Record<string, unknown>} values
 * @param {(percent:number, label?:string)=>void} [onProgress]
 * @returns {Promise<{blob: Blob, bytes: Uint8Array}>}
 */
export async function writeMetadata(arrayBuffer, format, mode, values, onProgress) {
  if (!MIME[format]) {
    throw new Error('Metadata writing is currently supported for JPEG, PNG and WebP.');
  }

  let source = arrayBuffer;

  if (mode === 'remove') {
    onProgress?.(4, 'Removing existing metadata…');
    await pause();
    const stripped = await stripMetadata(arrayBuffer, format, (percent) => {
      onProgress?.(4 + Math.round(percent * 0.32), 'Removing existing metadata…');
    });
    source = await stripped.blob.arrayBuffer();
  }

  onProgress?.(42, 'Building EXIF, IPTC and XMP…');
  await pause();

  let output;
  if (format === 'jpeg') output = writeJpegMetadata(source, values);
  else if (format === 'png') output = writePngMetadata(source, values);
  else output = writeWebpMetadata(source, values);

  onProgress?.(78, 'Writing metadata into the image…');
  await pause();

  const blob = new Blob([output], { type: getFormatMime(format) });
  onProgress?.(88, 'Preparing verification…');

  return { blob, bytes: output };
}
