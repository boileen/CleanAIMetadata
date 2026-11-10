import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND_CONFIG } from '../../config/brandConfig';

export default function SeoHead({
  title,
  description,
  canonical,
  keywords,
  schemaJson,
}) {
  const metaTitle = title || `${BRAND_CONFIG.name} — 100% Client-Side Privacy Lab`;
  const metaDesc = description || 'Inspect, sanitize, and losslessly remove AI provenance credentials (C2PA) and EXIF metadata without uploading files to servers.';
  const metaCanonical = canonical || BRAND_CONFIG.canonicalBase;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={metaCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url" content={metaCanonical} />
      <meta property="og:site_name" content={BRAND_CONFIG.name} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />

      {/* Structured Data (JSON-LD) */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
}
