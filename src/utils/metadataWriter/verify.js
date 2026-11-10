/**
 * Read-back verification.
 *
 * After writing, the output is re-parsed with exifr and every non-empty editor
 * field is compared with the value that was requested. This catches container
 * or encoding mistakes without trusting the writer's own bookkeeping.
 */

import { readMetadata } from '../metadataReader';
import { isEmptyValue, valuesEqual } from '../metadataNormalize';
import { METADATA_FIELDS, isFieldSupported } from '../../config/metadataSchema';

function findAscii(bytes, text) {
  const needle = new TextEncoder().encode(text);
  const last = bytes.length - needle.length;
  outer: for (let i = 0; i <= last; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (bytes[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

/** True when the container still carries an embedded ICC colour profile. */
export function hasIccProfile(arrayBuffer, format) {
  if (!arrayBuffer) return false;
  const bytes =
    arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);

  if (format === 'jpeg') return findAscii(bytes, 'ICC_PROFILE');
  if (format === 'png') return findAscii(bytes, 'iCCP');
  if (format === 'webp') return findAscii(bytes, 'ICCP');
  return false;
}

/**
 * @param {Blob} blob written image
 * @param {File} file original file (used for name/MIME fallbacks)
 * @param {'jpeg'|'png'|'webp'} format
 * @param {Record<string, unknown>} values values requested by the editor
 * @param {ArrayBuffer} [originalBuffer]
 */
export async function verifyWrittenMetadata(blob, file, format, values, originalBuffer) {
  const buffer = await blob.arrayBuffer();
  const outputBytes = new Uint8Array(buffer);
  let editable = {};
  let readError = null;

  try {
    const metadata = await readMetadata(buffer, file, format, { includeEditable: true });
    editable = metadata?.editableMetadata || {};
  } catch (err) {
    readError = err?.message || 'The output could not be read back.';
  }

  const fields = [];
  const byId = new Map();

  for (const field of METADATA_FIELDS) {
    if (!isFieldSupported(field, format)) continue;
    const expected = values?.[field.id];
    if (isEmptyValue(expected)) continue;

    let actual = editable[field.id];
    let ok = valuesEqual(field, expected, actual);

    // exifr never surfaces EXIF UserComment, so confirm it from the raw bytes
    // instead of trusting the parser. Prefer the ASCII-prefixed form to avoid
    // matching unrelated text elsewhere in the container.
    if (!ok && field.id === 'userComment') {
      const text = String(expected);
      if (
        findAscii(outputBytes, `ASCII\0\0\0${text}`) ||
        findAscii(outputBytes, text)
      ) {
        ok = true;
        actual = text;
      }
    }

    if (byId.has(field.id)) {
      const existing = byId.get(field.id);
      existing.ok = existing.ok || ok;
      if (!existing.tabs.includes(field.tab)) existing.tabs.push(field.tab);
      if (!ok && actual) existing.actual = actual;
      continue;
    }

    const entry = {
      id: field.id,
      label: field.label,
      tab: field.tab,
      tabs: [field.tab],
      expected: String(expected),
      actual: isEmptyValue(actual) ? '' : String(actual),
      ok,
    };
    byId.set(field.id, entry);
    fields.push(entry);
  }

  const passed = fields.filter((field) => field.ok).length;
  const failed = fields.length - passed;
  const iccPresent = hasIccProfile(buffer, format);
  const originalHadIcc = originalBuffer ? hasIccProfile(originalBuffer, format) : false;

  return {
    ok: !readError && failed === 0,
    checked: fields.length,
    passed,
    failed,
    fields,
    readError,
    iccPresent,
    iccPreserved: !originalHadIcc || iccPresent,
    outputSize: blob.size,
  };
}
