/**
 * Normalise exifr's raw tag output into the flat, editable field map used by
 * the metadata editor and the read-back verifier.
 */

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function isBinary(value) {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof value === 'object' && value !== null && typeof value.byteLength === 'number' && !Array.isArray(value))
  );
}

function decodeBinary(value) {
  try {
    const view =
      value instanceof ArrayBuffer
        ? new Uint8Array(value)
        : new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength);
    let text = new TextDecoder('utf-8').decode(view);
    // EXIF UserComment carries an 8-byte character-code prefix.
    text = text.replace(/^(ASCII|UNICODE|JIS|undefined)\0+/i, '');
    return text.replace(/\0+$/g, '').trim();
  } catch {
    return '';
  }
}

/**
 * exifr decodes IPTC as Latin-1 even when the segment declares UTF-8, so
 * multi-byte characters arrive as mojibake ("Â©"). Re-decode when the string
 * is valid UTF-8, and leave genuine Latin-1 text untouched.
 */
function repairMojibake(text) {
  if (!text || !/[ÂÃÄÅâãð]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(text, (char) => char.codePointAt(0) & 0xff);
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
}

/** Unwrap exifr's XMP language alternatives: { lang, value } → value. */
function unwrap(value) {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    if (
      !current ||
      typeof current !== 'object' ||
      Array.isArray(current) ||
      current instanceof Date ||
      isBinary(current)
    ) {
      break;
    }
    if (current.value !== undefined) current = current.value;
    else if (current._value !== undefined) current = current._value;
    else break;
  }
  return current;
}

function asText(value) {
  if (value === undefined || value === null) return '';
  if (isBinary(value)) return repairMojibake(decodeBinary(value));
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString();
    if (value.value !== undefined) return asText(value.value);
    if ('numerator' in value && 'denominator' in value) {
      const n = Number(value.numerator);
      const d = Number(value.denominator);
      if (Number.isFinite(n) && Number.isFinite(d) && d !== 0) return String(n / d);
    }
    return '';
  }
  return repairMojibake(String(value));
}

/** Display "1/125" for fast shutter speeds while keeping larger values plain. */
function asShutter(value) {
  const number = Number(value);
  if (Number.isFinite(number) && number > 0 && number < 0.5) {
    const denominator = Math.round(1 / number);
    if (Math.abs(1 / denominator - number) < 1e-6) return `1/${denominator}`;
  }
  return asText(value);
}

function dmsToDecimal(value) {
  if (!Array.isArray(value) || value.length < 3) return null;
  const degrees = Number(asText(value[0]));
  const minutes = Number(asText(value[1]));
  const seconds = Number(asText(value[2]));
  if (![degrees, minutes, seconds].every(Number.isFinite)) return null;
  const sign = degrees < 0 ? -1 : 1;
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

function asCoordinate(value, reference) {
  const decimal = dmsToDecimal(value);
  let result = decimal;
  if (result === null) {
    const number = Number(asText(value));
    result = Number.isFinite(number) ? number : null;
  }
  if (result === null) return '';
  const ref = String(reference || '').toUpperCase();
  if (ref === 'S' || ref === 'W') result = -Math.abs(result);
  return String(Math.round(result * 1e6) / 1e6);
}

function asKeywords(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const inner = unwrap(value);
    if (inner !== value) return asKeywords(inner);
    return '';
  }
  return repairMojibake(String(value));
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

export function toExifDateValue(value) {
  if (value === undefined || value === null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}:${pad2(value.getMonth() + 1)}:${pad2(value.getDate())} ${pad2(
      value.getHours(),
    )}:${pad2(value.getMinutes())}:${pad2(value.getSeconds())}`;
  }
  const text = String(value).trim();
  if (/^\d{4}:\d{2}:\d{2}/.test(text)) {
    return text.length === 10 ? `${text} 00:00:00` : text;
  }
  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (match) {
    return `${match[1]}:${match[2]}:${match[3]} ${match[4] || '00'}:${match[5] || '00'}:${
      match[6] || '00'
    }`;
  }
  return text;
}

export function toInputDateTime(value) {
  if (value === undefined || value === null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
      value.getDate(),
    )}T${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
  }
  const text = String(value).trim();
  const exif = text.match(/^(\d{4}):(\d{2}):(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (exif) {
    return `${exif[1]}-${exif[2]}-${exif[3]}T${exif[4] || '00'}:${exif[5] || '00'}`;
  }
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}T${iso[4] || '00'}:${iso[5] || '00'}`;
  }
  return text;
}

export function toInputDate(value) {
  if (value === undefined || value === null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  const text = String(value).trim();
  const match = text.match(/^(\d{4})[-:/]?(\d{2})[-:/]?(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return text;
}

export function buildEditableMetadata(parsed = {}) {
  const contactInfo =
    parsed.CreatorContactInfo && typeof parsed.CreatorContactInfo === 'object'
      ? parsed.CreatorContactInfo
      : {};

  const keywords = firstDefined(parsed.Keywords, parsed.subject, parsed['Keywords']);
  const creator = firstDefined(
    parsed.Byline,
    parsed['By-line'],
    parsed.creator,
    parsed.Artist,
  );
  const title = firstDefined(parsed.ObjectName, parsed.title);
  const caption = firstDefined(
    parsed['Caption-Abstract'],
    parsed.Caption,
    parsed.description,
    parsed.ImageDescription,
  );
  const copyright = firstDefined(
    parsed.CopyrightNotice,
    parsed.Copyright,
    parsed.rights,
  );

  return {
    // EXIF
    make: asText(firstDefined(parsed.Make, parsed.make)),
    model: asText(firstDefined(parsed.Model, parsed.model)),
    lensModel: asText(firstDefined(parsed.LensModel, parsed.lensModel)),
    lensMake: asText(firstDefined(parsed.LensMake, parsed.lensMake)),
    serialNumber: asText(
      firstDefined(
        parsed.SerialNumber,
        parsed.BodySerialNumber,
        parsed.CameraSerialNumber,
      ),
    ),
    iso: asText(firstDefined(parsed.ISO, parsed.ISOSpeedRatings)),
    fNumber: asText(firstDefined(parsed.FNumber, parsed.ApertureValue)),
    exposureTime: asShutter(firstDefined(parsed.ExposureTime, parsed.ShutterSpeedValue)),
    focalLength: asText(parsed.FocalLength),
    focalLength35mm: asText(
      firstDefined(parsed.FocalLengthIn35mmFormat, parsed.FocalLengthIn35mmFilm),
    ),
    exposureCompensation: asText(
      firstDefined(parsed.ExposureCompensation, parsed.ExposureBiasValue),
    ),
    exposureProgram: asText(parsed.ExposureProgram),
    meteringMode: asText(parsed.MeteringMode),
    whiteBalance: asText(parsed.WhiteBalance),
    flash: asText(parsed.Flash),
    colorSpace: asText(parsed.ColorSpace),
    orientation: asText(parsed.Orientation),
    dateTimeOriginal: toInputDateTime(firstDefined(parsed.DateTimeOriginal, parsed.CreateDate)),
    createDate: toInputDateTime(firstDefined(parsed.CreateDate, parsed.DateTimeDigitized)),
    modifyDate: toInputDateTime(firstDefined(parsed.ModifyDate, parsed.DateTime)),
    imageDescription: asText(firstDefined(parsed.ImageDescription, parsed.description)),
    artist: asText(firstDefined(parsed.Artist, parsed['By-line'], parsed.Byline, parsed.creator)),
    copyright: asText(copyright),
    software: asText(firstDefined(parsed.Software, parsed.CreatorTool)),
    userComment: asText(parsed.UserComment),
    gpsLatitude: asCoordinate(
      firstDefined(parsed.latitude, parsed.GPSLatitude),
      firstDefined(parsed.GPSLatitudeRef, parsed.latitudeRef),
    ),
    gpsLongitude: asCoordinate(
      firstDefined(parsed.longitude, parsed.GPSLongitude),
      firstDefined(parsed.GPSLongitudeRef, parsed.longitudeRef),
    ),
    gpsAltitude: asText(firstDefined(parsed.GPSAltitude, parsed.altitude)),

    // IPTC
    title: asText(title),
    headline: asText(firstDefined(parsed.Headline, parsed.headline)),
    caption: asText(caption),
    keywords: asKeywords(keywords),
    creator: asText(creator),
    credit: asText(firstDefined(parsed.Credit, parsed.credit)),
    source: asText(firstDefined(parsed.Source, parsed.source)),
    contact: asText(firstDefined(parsed.Contact, parsed.contact)),
    city: asText(firstDefined(parsed.City, parsed.city)),
    state: asText(firstDefined(parsed.State, parsed['Province-State'], parsed.state)),
    country: asText(
      firstDefined(parsed.Country, parsed['Country-PrimaryLocationName'], parsed.country),
    ),
    sublocation: asText(
      firstDefined(parsed.Sublocation, parsed['Sub-location'], parsed.Location, parsed.sublocation),
    ),
    countryCode: asText(
      firstDefined(parsed.CountryCode, parsed['Country-PrimaryLocationCode'], parsed.countryCode),
    ),
    dateCreated: toInputDate(firstDefined(parsed.DateCreated, parsed.dateCreated)),
    captionWriter: asText(
      firstDefined(parsed.Writer, parsed.CaptionWriter, parsed.captionWriter),
    ),
    instructions: asText(
      firstDefined(parsed.SpecialInstructions, parsed.Instructions, parsed.instructions),
    ),
    jobIdentifier: asText(
      firstDefined(
        parsed.OriginalTransmissionReference,
        parsed.JobID,
        parsed.TransmissionReference,
        parsed.jobIdentifier,
      ),
    ),
    creatorJobTitle: asText(
      firstDefined(parsed.BylineTitle, parsed.AuthorsPosition, parsed.creatorJobTitle),
    ),

    // XMP
    xmpTitle: asText(firstDefined(parsed.title, parsed.Title)),
    xmpDescription: asText(firstDefined(parsed.description, parsed.Description)),
    xmpAuthor: asText(firstDefined(parsed.creator, parsed.Creator)),
    creatorTool: asText(firstDefined(parsed.CreatorTool, parsed.creatorTool)),
    xmpSoftware: asText(
      firstDefined(parsed.CreatorTool, parsed.creatorTool, parsed.Software, parsed.software),
    ),
    history: asText(firstDefined(parsed.History, parsed.history)),
    rating: asText(parsed.Rating),
    label: asText(parsed.Label),
    xmpCreateDate: toInputDateTime(firstDefined(parsed.CreateDate, parsed.createDate)),
    xmpModifyDate: toInputDateTime(firstDefined(parsed.ModifyDate, parsed.modifyDate)),
    usageTerms: asText(firstDefined(parsed.UsageTerms, parsed.usageTerms)),
    copyrightUrl: asText(firstDefined(parsed.WebStatement, parsed.copyrightUrl)),
    copyrightStatus: asText(firstDefined(parsed.Marked, parsed.copyrightStatus)),
    creatorEmail: asText(
      firstDefined(parsed.CiEmailWork, contactInfo.CiEmailWork, parsed.creatorEmail),
    ),
    creatorWebsite: asText(
      firstDefined(parsed.CiUrlWork, contactInfo.CiUrlWork, parsed.creatorWebsite),
    ),
    creatorPhone: asText(
      firstDefined(parsed.CiTelWork, contactInfo.CiTelWork, parsed.creatorPhone),
    ),
    creatorAddress: asText(
      firstDefined(parsed.CiAdrExtadr, contactInfo.CiAdrExtadr, parsed.creatorAddress),
    ),
    creatorCity: asText(
      firstDefined(parsed.CiAdrCity, contactInfo.CiAdrCity, parsed.creatorCity),
    ),
    creatorCountry: asText(
      firstDefined(parsed.CiAdrCtry, contactInfo.CiAdrCtry, parsed.creatorCountry),
    ),
  };
}

export function isEmptyValue(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function parseNumeric(value) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (!text) return null;
  const fraction = text.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (Number.isFinite(denominator) && denominator !== 0) {
      return Number(fraction[1]) / denominator;
    }
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function valuesEqual(field, left, right) {
  if (isEmptyValue(left) && isEmptyValue(right)) return true;
  if (isEmptyValue(left) || isEmptyValue(right)) return false;

  const textLeft = String(left).trim();
  const textRight = String(right).trim();

  if (field?.type === 'gps') {
    const a = parseNumeric(textLeft);
    const b = parseNumeric(textRight);
    if (a !== null && b !== null) return Math.abs(a - b) < 0.00001;
  }

  if (field?.type === 'datetime' || field?.type === 'date' || field?.id?.toLowerCase().includes('date')) {
    return toExifDateValue(textLeft).slice(0, 16) === toExifDateValue(textRight).slice(0, 16);
  }

  const numericLeft = parseNumeric(textLeft);
  const numericRight = parseNumeric(textRight);
  if (numericLeft !== null && numericRight !== null) {
    return Math.abs(numericLeft - numericRight) < 0.00001;
  }

  return textLeft.toLowerCase() === textRight.toLowerCase();
}
