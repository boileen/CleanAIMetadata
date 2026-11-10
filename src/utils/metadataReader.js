/**
 * Metadata reader (powered by exifr).
 *
 * Extracts EXIF / XMP / IPTC / PNG-IHDR / GPS data and organises it into the
 * two sections used by the UI (File Information + Other metadata). Also
 * inspects the raw bytes for AI / C2PA signatures so we can show an
 * "AI Footprint" score.
 */

import exifr from 'exifr';
import { formatBytes } from './format';
import { formatLabel } from './fileValidation';
import { buildEditableMetadata } from './metadataNormalize';
import { extractWebpMetadata, wrapXmpAsJpeg } from './webpContainer';

const AI_TOOLS = [
  'midjourney',
  'dall-e',
  'dall·e',
  'stable diffusion',
  'stablediffusion',
  'firefly',
  'leonardo',
  'runway',
  'imagen',
  'flux.1',
  'comfyui',
  'automatic1111',
  'novelai',
  'openai',
  'chatgpt',
  'gpt-4',
  'generative fill',
];

// Tiff keys that hold binary blobs — never useful in a UI table.
const SKIP_KEYS = new Set([
  'thumbnail', 'Thumbnail', 'MakerNote', 'UserComment', 'PrintImageMatching',
  'ImageSourceData', 'XMLPacket', 'ICC_Profile', 'ApplicationNotes', 'PhotoStudio',
  'ImageData', 'StripOffsets', 'StripByteCounts', 'TileOffsets', 'TileByteCounts',
  'JPEGTables', 'DNGPrivateData', 'OpcodeList1', 'OpcodeList2', 'OpcodeList3',
  'InteropIndex', 'InteropVersion',
]);

const EXIF_KEY_HINTS = [
  'Make', 'Model', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 'ISO',
  'FocalLength', 'LensModel', 'ExifVersion', 'ApertureValue', 'ShutterSpeedValue',
];

// Structural image fields that are NOT removable metadata (they describe the
// pixels themselves and always remain after cleaning).
const STRUCTURAL_KEYS = new Set([
  'ImageWidth', 'ImageHeight', 'ExifImageWidth', 'ExifImageHeight',
  'PixelXDimension', 'PixelYDimension', 'ImageSize', 'Megapixels',
  'FileTypeExtension', 'BitDepth', 'ColorType', 'Compression', 'Filter',
  'Interlace', 'BitsPerSample', 'ColorComponents', 'EncodingProcess',
  'YCbCrSubSampling', 'JFIFVersion', 'ResolutionUnit',
]);

// exifr groups its output by parser when `mergeOutput` is disabled. These
// prefixes make it obvious where every raw tag came from.
const GROUP_PREFIXES = {
  ifd0: 'EXIF',
  ifd1: 'EXIF',
  exif: 'EXIF',
  interop: 'EXIF',
  gps: 'GPS',
  iptc: 'IPTC',
  xmp: 'XMP',
  icc: 'ICC',
  jfif: 'JFIF',
  ihdr: 'PNG',
};

// PNG IHDR fields shown with raw (untranslated) values, matching the
// reference metadata inspector.
const PNG_IHDR_KEYS = [
  'ImageWidth', 'ImageHeight', 'BitDepth', 'ColorType', 'Compression', 'Filter', 'Interlace',
];

/**
 * Read the PNG IHDR chunk directly from the bytes. exifr translates these
 * values into human strings; the inspector wants the raw numbers.
 */
function readPngIhdr(bytes) {
  if (!bytes || bytes.length < 29) return null;
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
      ImageWidth: view.getUint32(16),
      ImageHeight: view.getUint32(20),
      BitDepth: bytes[24],
      ColorType: bytes[25],
      Compression: bytes[26],
      Filter: bytes[27],
      Interlace: bytes[28],
    };
  } catch {
    return null;
  }
}

function isBinary(value) {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof value === 'object' && value !== null && value.constructor && value.constructor.name === 'Buffer')
  );
}

function stringifyValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? String(v) : String(v))).join(', ');
  }
  const str = String(value);
  return str.length > 300 ? `${str.slice(0, 300)}…` : str;
}

function flattenMetadata(obj, sources = null, maxDepth = 2) {
  const out = [];
  const seen = new Set();

  const walk = (node, path, depth, topKey) => {
    if (!node || typeof node !== 'object' || depth > maxDepth) return;
    for (const [key, value] of Object.entries(node)) {
      if (SKIP_KEYS.has(key)) continue;
      if (value === null || value === undefined) continue;
      if (isBinary(value)) continue;

      const rawKey = topKey || key;
      const rawLabel = path ? `${path}: ${key}` : key;
      const source = sources?.[rawKey];
      const label = source && !path ? `${source}: ${rawLabel}` : rawLabel;

      if (value instanceof Date || Array.isArray(value) || typeof value !== 'object') {
        if (seen.has(label)) continue;
        seen.add(label);
        out.push({ key: label, rawKey, value: stringifyValue(value) });
      } else {
        walk(value, label, depth + 1, rawKey);
      }
    }
  };

  walk(obj, '', 0, null);
  return out;
}

function getDimensions(parsed) {
  const width =
    parsed.ImageWidth ??
    parsed.ExifImageWidth ??
    parsed.PixelXDimension ??
    parsed.ImageSize?.width ??
    null;
  const height =
    parsed.ImageHeight ??
    parsed.ExifImageHeight ??
    parsed.PixelYDimension ??
    parsed.ImageSize?.height ??
    null;
  if (typeof width === 'number' && typeof height === 'number') {
    return { width, height };
  }
  return null;
}

async function getBitmapDimensions(file) {
  if (typeof createImageBitmap !== 'function' || !file) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    if (typeof bitmap.close === 'function') bitmap.close();
    return dims;
  } catch {
    return null;
  }
}

/** Return a standalone ArrayBuffer for a typed-array view. */
function viewToArrayBuffer(view) {
  if (!view) return null;
  if (view.byteOffset === 0 && view.byteLength === view.buffer.byteLength) {
    return view.buffer;
  }
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
}

/**
 * Merge exifr group output, keeping the first value seen for each key so
 * IFD0 wins over thumbnails and EXIF wins over XMP duplicates.
 */
function mergeGroups(target, groups) {
  if (!groups || typeof groups !== 'object') return target;
  Object.entries(groups).forEach(([group, values]) => {
    if (!values || typeof values !== 'object') return;
    target[group] = target[group] ? { ...values, ...target[group] } : values;
  });
  return target;
}

/**
 * exifr has no WebP container parser, so for WebP we extract the EXIF TIFF and
 * XMP packet ourselves and parse each with exifr in the same shape as a JPEG.
 */
async function parseContainer(arrayBuffer, format, parseOptions) {
  if (format !== 'webp') {
    return exifr.parse(arrayBuffer, parseOptions);
  }

  const { exif, xmp } = extractWebpMetadata(arrayBuffer);
  const merged = {};

  if (exif && exif.length) {
    try {
      const groups = await exifr.parse(viewToArrayBuffer(exif), {
        ...parseOptions,
        tiff: true,
        xmp: false,
        iptc: false,
        jfif: false,
        ihdr: false,
      });
      mergeGroups(merged, groups);
    } catch {
      /* A broken EXIF chunk should not hide valid XMP. */
    }
  }

  if (xmp) {
    try {
      const groups = await exifr.parse(wrapXmpAsJpeg(xmp), {
        ...parseOptions,
        tiff: false,
        xmp: true,
        iptc: false,
        jfif: false,
        ihdr: false,
      });
      mergeGroups(merged, groups);
    } catch {
      /* Ignore malformed XMP. */
    }
  }

  return merged;
}

/** Flatten exifr's grouped output, skipping the thumbnail IFD. */
function flattenGroups(grouped) {
  const flat = {};
  if (!grouped || typeof grouped !== 'object') return flat;

  Object.entries(grouped).forEach(([group, values]) => {
    if (group === 'ifd1') return;
    if (!values || typeof values !== 'object') return;
    Object.entries(values).forEach(([key, value]) => {
      if (!(key in flat)) flat[key] = value;
    });
  });

  return flat;
}


/**
 * Read all metadata from an image.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @param {File} file
 * @param {string} format detected format
 */
export async function readMetadata(arrayBuffer, file, format, options = {}) {
  const bytes = new Uint8Array(arrayBuffer);

  // Scan a bounded slice of the raw bytes for signature strings. Metadata
  // headers live at the start of the file, so 4 MB is plenty and keeps this
  // fast even for large images.
  let scanText = '';
  try {
    const slice = bytes.subarray(0, Math.min(bytes.length, 4 * 1024 * 1024));
    scanText = new TextDecoder('latin1').decode(slice).toLowerCase();
  } catch {
    scanText = '';
  }

  // Parse with grouped output so every tag keeps its source (EXIF / GPS /
  // IPTC / XMP / PNG …), then merge ourselves into the flat view the legacy
  // groups expect.
  let parsed = {};
  let groupSources = null;
  try {
    const grouped = await parseContainer(arrayBuffer, format, {
      tiff: true,
      xmp: true,
      iptc: true,
      jfif: true,
      ihdr: true,
      mergeOutput: false,
      translateValues: true,
      reviveValues: true,
      sanitize: true,
    });

    if (grouped && typeof grouped === 'object') {
      parsed = {};
      groupSources = {};

      Object.entries(grouped).forEach(([group, values]) => {
        // ifd1 mirrors ifd0 plus a thumbnail; it would overwrite real tags.
        if (group === 'ifd1') return;
        if (!values || typeof values !== 'object') return;

        Object.entries(values).forEach(([key, value]) => {
          // Keep the first occurrence (ifd0 before exif) and never let a
          // secondary group clobber a real value.
          if (!(key in parsed)) parsed[key] = value;
          if (GROUP_PREFIXES[group]) groupSources[key] = GROUP_PREFIXES[group];
        });
      });
    }
  } catch {
    parsed = {};
    groupSources = null;
  }

  // The editor needs raw, numeric tag values rather than exifr's translated
  // display strings. Parse again only when the caller asks for editable data.
  let editableMetadata = null;
  if (options.includeEditable) {
    try {
      const groupedRaw = await parseContainer(arrayBuffer, format, {
        tiff: true,
        xmp: true,
        iptc: true,
        jfif: true,
        ihdr: true,
        mergeOutput: false,
        translateValues: false,
        reviveValues: false,
        sanitize: true,
      });
      editableMetadata = buildEditableMetadata(flattenGroups(groupedRaw));
    } catch {
      editableMetadata = buildEditableMetadata({});
    }
  }

  const ihdr = format === 'png' ? readPngIhdr(bytes) : null;
  const dimensions =
    getDimensions(parsed) ||
    (ihdr ? { width: ihdr.ImageWidth, height: ihdr.ImageHeight } : null) ||
    (await getBitmapDimensions(file));

  const hasExifKeys = EXIF_KEY_HINTS.some((k) => parsed[k] !== undefined && parsed[k] !== null);
  const hasXmp = scanText.includes('xmpmeta') || scanText.includes('adobe.com/xap') || scanText.includes('w5m0mpcehihzreszntczkc9d');
  const hasIptc =
    scanText.includes('photoshop 3.0') ||
    scanText.includes('8bim') ||
    parsed.ObjectName !== undefined ||
    parsed['Caption-Abstract'] !== undefined;
  const hasExif = scanText.includes('exif\u0000\u0000') || hasExifKeys;
  const hasC2pa = scanText.includes('c2pa') || scanText.includes('jumbf') || scanText.includes('jumb');
  const hasGps =
    parsed.latitude !== undefined ||
    parsed.longitude !== undefined ||
    parsed.GPSLatitude !== undefined ||
    parsed.GPSLongitude !== undefined;
  const hasAiPrompt = /(^|[^a-z])(prompt|negative prompt)([^a-z]|$)/.test(scanText) || scanText.includes('stable diffusion');

  const presentFlags = {
    c2pa: hasC2pa,
    xmp: hasXmp,
    iptc: hasIptc,
    exif: hasExif,
    location: hasGps,
    aiPrompt: hasAiPrompt,
  };

  const aiSignals = [];
  if (hasC2pa) aiSignals.push('C2PA / JUMBF manifest detected');
  const aiToolMatches = AI_TOOLS.filter((tool) => scanText.includes(tool));
  if (aiToolMatches.length) {
    aiSignals.push(`AI software signature: ${aiToolMatches[0]}`);
  }
  if (scanText.includes('trainedalgorithmicmedia')) {
    aiSignals.push('IPTC trainedAlgorithmicMedia');
  }
  if (hasAiPrompt) {
    aiSignals.push('AI prompt / generation parameters');
  }

  let aiRisk = 'none';
  if (aiSignals.length >= 2 || hasC2pa) aiRisk = 'high';
  else if (aiSignals.length === 1) aiRisk = 'medium';

  const notPresent = [
    ['C2PA', 'c2pa'],
    ['XMP', 'xmp'],
    ['IPTC', 'iptc'],
    ['EXIF', 'exif'],
    ['Location', 'location'],
    ['AI prompt & settings', 'aiPrompt'],
  ]
    .filter(([, key]) => !presentFlags[key])
    .map(([label]) => label);

  // ---- File Information section -----------------------------------------
  const extension = file?.name?.includes('.')
    ? file.name.split('.').pop().toLowerCase()
    : format === 'jpeg'
      ? 'jpg'
      : format;

  const fileFields = [
    { key: 'Size', value: formatBytes(file?.size) },
    { key: 'Modified', value: file?.lastModified ? Math.floor(file.lastModified / 1000) : '—' },
    { key: 'Mime', value: file?.type || '—' },
    { key: 'Width', value: dimensions?.width ?? '—' },
    { key: 'Height', value: dimensions?.height ?? '—' },
    { key: 'Type', value: formatLabel(format) },
  ];

  // ---- Other metadata section -------------------------------------------
  const otherFields = [];

  if (dimensions) {
    otherFields.push({
      key: 'Image Size',
      rawKey: 'ImageSize',
      value: `${dimensions.width} ${dimensions.height}`,
    });
    otherFields.push({
      key: 'Megapixels',
      rawKey: 'Megapixels',
      value: ((dimensions.width * dimensions.height) / 1_000_000).toFixed(6),
    });
  }
  otherFields.push({
    key: 'File: File Type Extension',
    rawKey: 'FileTypeExtension',
    value: String(extension || '').toUpperCase(),
  });

  // PNG IHDR fields are read straight from the bytes so the values stay raw
  // (e.g. Color Type 2) instead of exifr's translated strings.
  if (ihdr) {
    const pngLabels = [
      ['Image Width', ihdr.ImageWidth],
      ['Image Height', ihdr.ImageHeight],
      ['Bit Depth', ihdr.BitDepth],
      ['Color Type', ihdr.ColorType],
      ['Compression', ihdr.Compression],
      ['Filter', ihdr.Filter],
      ['Interlace', ihdr.Interlace],
    ];
    pngLabels.forEach(([label, value]) => {
      otherFields.push({
        key: `PNG: ${label}`,
        rawKey: label.replace(/\s+/g, ''),
        value,
      });
    });
  }

  const parsedFields = flattenMetadata(parsed, groupSources);
  const existingKeys = new Set(otherFields.map((f) => f.key));
  const skipParsedKeys = ihdr ? new Set(PNG_IHDR_KEYS) : null;

  for (const field of parsedFields) {
    if (skipParsedKeys?.has(field.rawKey)) continue;
    if (existingKeys.has(field.key)) continue;
    otherFields.push(field);
    existingKeys.add(field.key);
  }

  const sections = [
    {
      id: 'file',
      title: 'File Information',
      shortTitle: 'File',
      description: 'File type, size and dimensions',
      fields: fileFields,
    },
    {
      id: 'other',
      title: 'Other metadata',
      shortTitle: 'Other',
      description: 'Other hidden details',
      fields: otherFields,
    },
  ];

  // ---- Legacy grouped views (used by the View / Edit / GeoTag pages) -----
  const exifGroup = {};
  [
    'Make', 'Model', 'LensModel', 'Software', 'Artist', 'Copyright',
    'ImageDescription', 'UserComment', 'Orientation', 'ColorSpace',
    'ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'DateTimeOriginal',
    'CreateDate', 'ModifyDate', 'DateTimeDigitized',
  ].forEach((key) => {
    if (parsed[key] !== undefined && parsed[key] !== null) {
      exifGroup[key] = stringifyValue(parsed[key]);
    }
  });

  const iptcGroup = {};
  if (hasIptc) {
    const iptcMap = {
      Artist: ['By-line', 'Artist'],
      Copyright: ['CopyrightNotice', 'Copyright'],
      Caption: ['Caption-Abstract', 'Caption'],
      ObjectName: ['ObjectName'],
      Keywords: ['Keywords'],
      Credit: ['Credit'],
      DigitalSourceType: ['DigitalSourceType'],
    };
    Object.entries(iptcMap).forEach(([outKey, sources]) => {
      for (const src of sources) {
        if (parsed[src] !== undefined && parsed[src] !== null) {
          iptcGroup[outKey] = stringifyValue(parsed[src]);
          break;
        }
      }
    });
  }

  const xmpGroup = {};
  if (hasXmp) {
    ['CreatorTool', 'creatorTool', 'Creator', 'Label', 'Rating', 'Subject'].forEach((key) => {
      if (parsed[key] !== undefined && parsed[key] !== null) {
        const outKey = key === 'creatorTool' ? 'CreatorTool' : key;
        if (xmpGroup[outKey] === undefined) xmpGroup[outKey] = stringifyValue(parsed[key]);
      }
    });
  }

  const gpsGroup = hasGps
    ? {
        latitude: parsed.latitude ?? parsed.GPSLatitude ?? null,
        longitude: parsed.longitude ?? parsed.GPSLongitude ?? null,
        altitude: parsed.GPSAltitude ?? null,
      }
    : null;

  const c2paGroup = hasC2pa
    ? { Manifest: 'C2PA / JUMBF manifest detected' }
    : null;

  const removableFields = parsedFields.filter((field) => !STRUCTURAL_KEYS.has(field.rawKey));
  const removableTagCount = removableFields.length + (hasC2pa ? 1 : 0);

  return {
    sections,
    totalFields: fileFields.length + otherFields.length,
    aiRisk,
    aiSignals,
    presentFlags,
    notPresent,
    dimensions,
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
    editableMetadata,
    // legacy/compat groups
    exif: exifGroup,
    iptc: iptcGroup,
    xmp: xmpGroup,
    gps: gpsGroup,
    c2pa: c2paGroup,
    totalTagCount: removableTagCount,
    removableTagCount,
    flatFields: otherFields,
  };
}
