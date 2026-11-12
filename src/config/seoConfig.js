import { BRAND_CONFIG } from './brandConfig';

/**
 * Route-by-route SEO metadata and structured data configuration
 */
export const SEO_CONFIG = {
  home: {
    path: '/',
    exactTitle: `Remove AI Metadata & C2PA from Images Free | ${BRAND_CONFIG.name}`,
    h1: 'Remove AI Detection & Metadata from Images',
    eyebrow: '• PRIVATE QUICK CONVERT',
    description: 'Scrub C2PA provenance, invisible watermarks, EXIF, IPTC, and generative AI signatures directly inside your browser tab. 100% private, zero uploads to external servers.',
    keywords: 'clean ai metadata, remove ai metadata from image, c2pa remover, strip c2pa, instagram made with ai fix',
    canonical: `${BRAND_CONFIG.canonicalBase}/`,
    breadcrumb: 'Home',
  },
  viewMetadata: {
    path: '/view-metadata',
    altPaths: ['/view-image-metadata/'],
    exactTitle: `View Image Metadata, EXIF & C2PA Inspector | ${BRAND_CONFIG.name}`,
    h1: 'View & Inspect Hidden Image Metadata',
    eyebrow: '• DEEP FORENSIC INSPECTOR',
    description: 'Examine raw hex headers, C2PA digital provenance manifests, EXIF tags, GPS geotags, and hidden generative model signatures directly inside your client thread.',
    keywords: 'view image metadata, exif c2pa viewer, c2pa inspector, view iptc tags, image metadata viewer',
    canonical: `${BRAND_CONFIG.canonicalBase}/view-metadata`,
    breadcrumb: 'View Metadata',
  },
  editMetadata: {
    path: '/edit-metadata',
    altPaths: ['/add-image-metadata/'],
    exactTitle: `Edit Image Metadata & EXIF Tags Online Free | ${BRAND_CONFIG.name}`,
    h1: 'Edit Image Metadata & EXIF Tags Online',
    eyebrow: '• EXIF & PROVENANCE OVERWRITE',
    description: 'Modify EXIF parameters, insert natural DSLR camera profiles, or customize author & copyright details before sharing. Zero upload latency.',
    keywords: 'edit image metadata online, modify exif data, add camera exif, dslr preset exif, spoof image metadata',
    canonical: `${BRAND_CONFIG.canonicalBase}/edit-metadata`,
    breadcrumb: 'Edit Metadata',
  },
  geoTag: {
    path: '/geo-tag-photo',
    altPaths: ['/geo-tag-photo/'],
    exactTitle: `Geo Tag Photo Online — Add, Edit or Strip GPS | ${BRAND_CONFIG.name}`,
    h1: 'Geo Tag Photo & GPS Coordinate Editor',
    eyebrow: '• INTERACTIVE LOCATION ENGINE',
    description: 'Add, modify, or completely remove GPS geotag coordinates from your photos using an interactive map picker. 100% private in-browser geotagging for local SEO.',
    keywords: 'geo tag photo online, remove gps from photo, add gps coordinates to image, geotag photo online',
    canonical: `${BRAND_CONFIG.canonicalBase}/geo-tag-photo`,
    breadcrumb: 'Geo Tag Photo',
  },
  aiTextCleaner: {
    path: '/ai-text-cleaner',
    altPaths: ['/ai-text-watermark-remover/'],
    exactTitle: `AI Text Cleaner: Remove Hidden Characters & AI Tags | ${BRAND_CONFIG.name}`,
    h1: 'AI Text Cleaner',
    eyebrow: '• HIDDEN CHARACTERS, AI TAGS & WRITING PATTERNS',
    description: 'Remove zero-width characters, soft hyphens, AI metadata lines and chat-export markers from pasted text in your browser. Review writing patterns without rewriting a word.',
    keywords: 'ai text cleaner, zero width space remover, remove ai metadata from text, invisible character remover, clean chatgpt text',
    canonical: `${BRAND_CONFIG.canonicalBase}/ai-text-cleaner`,
    breadcrumb: 'AI Text Cleaner',
  },
  instagramGuide: {
    path: '/instagram-ai-label-guide',
    altPaths: ['/remove-ai-info-instagram/'],
    exactTitle: `How to Remove the "AI Info" Label on Instagram (2026 Guide) | ${BRAND_CONFIG.name}`,
    h1: 'How to Prevent & Remove Instagram\'s "AI Info" Label',
    eyebrow: '• SOCIAL PLATFORM COMPLIANCE',
    description: 'Complete guide on why Meta automatically flags images with "AI Info" or "Made with AI", and how to export and strip provenance credentials before publishing.',
    keywords: 'remove ai info label instagram, made with ai fix, instagram ai label remover, meta c2pa badge',
    canonical: `${BRAND_CONFIG.canonicalBase}/instagram-ai-label-guide`,
    breadcrumb: 'Instagram AI Label Guide',
  },
};

/**
 * Generate WebApplication JSON-LD schema
 */
export const getWebApplicationSchema = (toolConfig) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": toolConfig.exactTitle,
  "description": toolConfig.description,
  "url": toolConfig.canonical,
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All modern browsers (Chrome, Firefox, Safari, Edge)",
  "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas & ArrayBuffer support.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": BRAND_CONFIG.name,
    "url": BRAND_CONFIG.canonicalBase
  }
});

/**
 * Generate FAQPage JSON-LD from a local FAQ list.
 * Pass the result alongside the WebApplication schema (arrays are valid).
 */
export const getFaqSchema = (faqs = []) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
