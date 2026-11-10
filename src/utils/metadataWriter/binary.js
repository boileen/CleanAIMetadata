/** Small binary helpers used by the metadata writers. */

export function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function asciiBytes(value) {
  const text = String(value ?? '');
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

export function utf8Bytes(value) {
  return new TextEncoder().encode(String(value ?? ''));
}

export function u16be(value) {
  return new Uint8Array([(value >> 8) & 0xff, value & 0xff]);
}

export function u32be(value) {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

export function u16le(value) {
  return new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
}

export function u32le(value) {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

export function padEven(bytes) {
  if (bytes.length % 2 === 0) return bytes;
  return concatBytes([bytes, new Uint8Array([0])]);
}

export function utf8ByteLength(value) {
  return utf8Bytes(value).length;
}

/** Truncate a string without splitting a UTF-8 code point. */
export function truncateUtf8(value, maxBytes) {
  const text = String(value ?? '');
  if (utf8ByteLength(text) <= maxBytes) return text;

  let out = '';
  let used = 0;
  for (const char of text) {
    const size = utf8ByteLength(char);
    if (used + size > maxBytes) break;
    out += char;
    used += size;
  }
  return out;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
