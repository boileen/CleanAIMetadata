/**
 * XMP packet builder.
 *
 * Builds a compact RDF/XML packet and mirrors the IPTC Core fields that have
 * XMP equivalents so WebP and PNG keep the caption, credit and rights data.
 */

import { utf8Bytes } from './binary';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function alt(tag, value) {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  return `    <${tag}>\n      <rdf:Alt>\n        <rdf:li xml:lang="x-default">${escapeXml(
    value,
  )}</rdf:li>\n      </rdf:Alt>\n    </${tag}>`;
}

function seq(tag, values) {
  const list = (Array.isArray(values) ? values : [values]).filter(
    (value) => value !== null && value !== undefined && String(value).trim() !== '',
  );
  if (!list.length) return '';
  return `    <${tag}>\n      <rdf:Seq>\n${list
    .map((value) => `        <rdf:li>${escapeXml(value)}</rdf:li>`)
    .join('\n')}\n      </rdf:Seq>\n    </${tag}>`;
}

function bag(tag, values) {
  const list = (Array.isArray(values) ? values : String(values ?? '').split(','))
    .map((value) => String(value).trim())
    .filter(Boolean);
  if (!list.length) return '';
  return `    <${tag}>\n      <rdf:Bag>\n${list
    .map((value) => `        <rdf:li>${escapeXml(value)}</rdf:li>`)
    .join('\n')}\n      </rdf:Bag>\n    </${tag}>`;
}

function simple(tag, value) {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  return `    <${tag}>${escapeXml(value)}</${tag}>`;
}

export function toIsoDate(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  const text = String(value).trim();
  if (/^\d{4}:\d{2}:\d{2}/.test(text)) {
    const [datePart, timePart] = text.replace(/:\d{2}$/, '').split(' ');
    return `${datePart.replace(/:/g, '-')}T${timePart || '00:00:00'}`;
  }
  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}T${match[4] || '00'}:${match[5] || '00'}:${
      match[6] || '00'
    }`;
  }
  return text;
}

export function toIptcDate(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (/^\d{4}:\d{2}:\d{2}/.test(text)) return text.slice(0, 10).replace(/:/g, '-');
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : text;
}

function creatorContactInfo(values) {
  const children = [
    simple('Iptc4xmpCore:CiAdrExtadr', values.creatorAddress),
    simple('Iptc4xmpCore:CiAdrCity', values.creatorCity),
    simple('Iptc4xmpCore:CiAdrCtry', values.creatorCountry),
    simple('Iptc4xmpCore:CiEmailWork', values.creatorEmail),
    simple('Iptc4xmpCore:CiTelWork', values.creatorPhone),
    simple('Iptc4xmpCore:CiUrlWork', values.creatorWebsite),
  ].filter(Boolean);

  if (!children.length) return '';
  return `    <Iptc4xmpCore:CreatorContactInfo rdf:parseType="Resource">\n${children.join(
    '\n',
  )}\n    </Iptc4xmpCore:CreatorContactInfo>`;
}

export function hasXmpValues(values = {}) {
  return [
    'xmpTitle', 'xmpDescription', 'xmpAuthor', 'creatorTool', 'xmpSoftware',
    'history', 'rating', 'label', 'xmpCreateDate', 'xmpModifyDate',
    'usageTerms', 'copyrightUrl', 'copyrightStatus', 'creatorEmail',
    'creatorWebsite', 'creatorPhone', 'creatorAddress', 'creatorCity',
    'creatorCountry', 'title', 'caption', 'keywords', 'creator', 'copyright',
    'imageDescription', 'artist', 'software', 'headline', 'credit', 'source',
    'city', 'state', 'country', 'sublocation', 'countryCode', 'dateCreated',
    'captionWriter', 'instructions', 'jobIdentifier', 'creatorJobTitle',
  ].some((key) => values[key] !== undefined && values[key] !== null && String(values[key]).trim() !== '');
}

/**
 * Build an XMP packet. Returns an empty string when there is nothing to write.
 * @param {Record<string, unknown>} values
 */
export function buildXmpPacket(values = {}) {
  if (!hasXmpValues(values)) return '';

  const title = values.xmpTitle || values.title;
  const description = values.xmpDescription || values.caption || values.imageDescription;
  const creator = values.xmpAuthor || values.creator || values.artist;
  const createDate = values.xmpCreateDate || values.createDate || values.dateTimeOriginal;
  const modifyDate = values.xmpModifyDate || values.modifyDate;

  const properties = [
    alt('dc:title', title),
    alt('dc:description', description),
    seq('dc:creator', creator),
    alt('dc:rights', values.copyright),
    bag('dc:subject', values.keywords),

    simple('xmp:CreatorTool', values.creatorTool || values.xmpSoftware || values.software),
    simple('xmp:CreateDate', toIsoDate(createDate)),
    simple('xmp:ModifyDate', toIsoDate(modifyDate)),
    simple('xmp:Label', values.label),
    simple('xmp:Rating', values.rating),

    simple('photoshop:Headline', values.headline),
    simple('photoshop:Credit', values.credit),
    simple('photoshop:Source', values.source),
    simple('photoshop:City', values.city),
    simple('photoshop:State', values.state),
    simple('photoshop:Country', values.country),
    simple('photoshop:DateCreated', toIptcDate(values.dateCreated)),
    simple('photoshop:CaptionWriter', values.captionWriter),
    simple('photoshop:Instructions', values.instructions),
    simple('photoshop:TransmissionReference', values.jobIdentifier),
    simple('photoshop:AuthorsPosition', values.creatorJobTitle),
    simple('photoshop:History', values.history),

    alt('xmpRights:UsageTerms', values.usageTerms),
    simple('xmpRights:WebStatement', values.copyrightUrl),
    simple('xmpRights:Marked', values.copyrightStatus),

    simple('Iptc4xmpCore:Location', values.sublocation),
    simple('Iptc4xmpCore:CountryCode', values.countryCode),
    creatorContactInfo(values),
  ].filter(Boolean);

  if (!properties.length) return '';

  const packet = `<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="CleanAIMetadata 1.0">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
      xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
      xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/">
${properties.join('\n')}
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
${' '.repeat(2048)}<?xpacket end="w"?>`;

  return packet;
}

export function xmpBytes(values) {
  const packet = buildXmpPacket(values);
  return packet ? utf8Bytes(packet) : null;
}
