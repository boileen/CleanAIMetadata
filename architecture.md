# Architecture Specification: AI Metadata Eraser Suite

## 1. Executive Summary & Vision
**AI Metadata Eraser** is a high-performance, SEO-optimized, 100% client-side web utility suite designed to inspect, sanitize, edit, and losslessly remove AI provenance credentials (C2PA/JUMBF manifests, IPTC DigitalSourceType, PNG tEXt/iTXt chunks) and traditional camera metadata (EXIF, IPTC, GPS coordinates) without re-compressing image pixels.

- **Visual Inspiration:** **Unheic.io** (minimalist Swiss utility, high-contrast light mode, generous whitespace, crisp 1px borders, zero intrusive above-the-fold clutter).
- **Functional Source:** **DeleteFootprints.ai** (5-in-1 privacy tools, batch processing, 4-step workflow, feature directory, and educational SEO content).
- **Execution Model:** 100% Browser Client-Side (`ArrayBuffer`, `DataView`, `Blob`). Zero server uploads.
- **Branding Strategy:** Centralized placeholder abstraction (`brandConfig.js`) for seamless 1-click global rebranding.

---

## 2. Extreme SEO Architecture for Client-Side SPA

Search engine crawlers index client-side Single Page Applications when the document hierarchy, semantic markup, and dynamic meta/schema injection are rigorously structured.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        5-PILLAR SEO ENGINE                             │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│ 1. Metadata Head  │ 2. Schema.org     │ 3. Semantic       │ 4. Link &  │
│    Management     │    JSON-LD        │    Hierarchy      │    Crawl   │
├───────────────────┼───────────────────┼───────────────────┼────────────┤
│ • Dynamic Titles  │ • WebApplication  │ • Native <h1>-<h6>│ • Sticky   │
│ • Canonical Tags  │ • FAQPage Schema  │ • <section>       │   Navbar   │
│ • Targeted Meta   │ • HowTo Schema    │ • <article>       │ • Multi-col│
│ • OpenGraph &     │ • BreadcrumbList  │ • <details> /     │   Footer   │
│   Twitter Cards   │                   │   <summary>       │ • Sitemap  │
└───────────────────┴───────────────────┴───────────────────┴────────────┘
                                     ▲
                                     │
                    5. Core Web Vitals Optimization:
              Sub-second render • Zero blocking 3rd-party scripts
```

### 2.1 Route & Keyword Target Matrix
| Route | Legacy / Alt Paths | Primary Keywords | Exact `<title>` Tag | Exact `<h1>` Heading |
|---|---|---|---|---|
| `/` | `/` | clean ai metadata, remove ai metadata from image, c2pa remover | Remove AI Metadata & C2PA from Images Free \| AI Metadata Eraser | Remove AI Detection & Metadata from Images |
| `/view-metadata` | `/view-image-metadata/` | view image metadata, exif c2pa viewer online | View Image Metadata, EXIF & C2PA Inspector \| AI Metadata Eraser | View & Inspect Hidden Image Metadata |
| `/edit-metadata` | `/add-image-metadata/` | edit image metadata online, modify exif data | Edit Image Metadata & EXIF Tags Online Free \| AI Metadata Eraser | Edit Image Metadata & EXIF Tags Online |
| `/geo-tag-photo` | `/geo-tag-photo/` | geo tag photo online, remove gps from photo | Geo Tag Photo Online — Add, Edit or Strip GPS \| AI Metadata Eraser | Geo Tag Photo & GPS Coordinate Editor |
| `/ai-text-cleaner` | `/ai-text-watermark-remover/` | ai text watermark remover, zero width space remover | AI Text Watermark & Hidden Character Cleaner \| AI Metadata Eraser | AI Text Watermark & Hidden Character Cleaner |
| `/instagram-ai-label-guide` | `/remove-ai-info-instagram/` | remove ai info label instagram, made with ai fix | How to Remove the "AI Info" Label on Instagram (2026 Guide) \| AI Metadata Eraser | How to Prevent & Remove Instagram's "AI Info" Label |

### 2.2 Programmatic Structured Data (JSON-LD)
Every route dynamically injects Google-compliant schema via `react-helmet-async`:
1. **`WebApplication` Schema:** Declares the software application, free pricing tier (`offers: { price: "0" }`), application category (`UtilitiesApplication`), and client execution requirements.
2. **`FAQPage` Schema:** Encodes each on-page accordion question and answer (all 10 questions verbatim from DeleteFootprints.ai), securing expandable rich snippet real estate on Google SERPs.
3. **`HowTo` Schema:** Structures the 4-step processing pipeline (`01 Inspect` → `02 Decode/Scan` → `03 Strip Losslessly` → `04 Verify Clean`).
4. **`BreadcrumbList` Schema:** Provides structured site navigation paths directly in search engine snippets.

### 2.3 Semantic Content & Fixture Inspection Engine
- **Verifiable Topical Authority:** Deep educational sections from DeleteFootprints.ai (definitions of C2PA, EXIF, JUMBF, IPTC, and generative model manifests like DALL-E 3, Midjourney, SDXL, and Firefly) are preserved in native semantic HTML below the workspace card.
- **Instant Client Demo Fixture (Unheic Pattern):** Includes a bundled local synthetic test file (`Try demo AI photo`) allowing first-time visitors to test instant C2PA detection and scrubbing without needing a file on hand.
- **Verification Matrix Table:** Features Unheic's "What survives the browser path?" verification table detailing exact header transformations (APP1/APP11 stripping vs pixel stream preservation).

---

## 3. Brand & Identity Abstraction Layer

All identity tokens, logos, domain configurations, and copy references are isolated into a single configuration file. Rebranding requires modifying only this file:

```javascript
// src/config/brandConfig.js
export const BRAND_CONFIG = {
  name: "AI Metadata Eraser",              // Placeholder App Name
  tagline: "Local Privacy Engine",      // Header Badge Subtitle
  domain: "aimetadataeraser.com",
  canonicalBase: "https://aimetadataeraser.com",
  logo: {
    type: "icon_text",                 // "icon_text" | "svg" | "image"
    text: "CleanAI",
    accent: "Metadata",
    iconName: "ShieldCheck",           // Lucide React Icon
  },
  social: {
    twitter: "https://twitter.com/placeholder",
    github: "https://github.com/placeholder",
  },
  supportEmail: "support@aimetadataeraser.com",
};
```

---

## 4. Design System & UI/UX Guidelines (Unheic.io Visual Skin)

The interface follows the utilitarian, high-contrast, minimalist aesthetic of **Unheic.io**:

- **Color Tokens:**
  - `bg-canvas`: `#F8FAFC` (Slate-50) – crisp neutral canvas giving separation to white cards.
  - `bg-card`: `#FFFFFF` – pure white container cards, inspector tables, and sticky navbar.
  - `border-subtle`: `#E2E8F0` (Slate-200) – crisp 1px borders with zero heavy drop shadows.
  - `text-primary`: `#0F172A` (Slate-900) – high-contrast headers, active links, and filenames.
  - `text-secondary`: `#475569` (Slate-600) – clear subtitles, body text, and FAQ answers.
  - `accent-primary`: `#2563EB` (Blue-600) / `#1E40AF` (Blue-800) – primary action CTAs and active tabs.
- **Status Badges:**
  - `AI Risk (High)`: Rose/Red (`text-rose-700 bg-rose-50 border-rose-200`) for C2PA, Midjourney, DALL-E signatures.
  - `Privacy Warning`: Amber/Yellow (`text-amber-700 bg-amber-50 border-amber-200`) for GPS coordinates, serial numbers.
  - `Verified Clean`: Emerald/Green (`text-emerald-700 bg-emerald-50 border-emerald-200`) for 0 footprints found.
- **Typography:**
  - Headings & UI: `Inter`, `Plus Jakarta Sans`, sans-serif.
  - Technical Data & Hex: `JetBrains Mono`, `Fira Code`, monospace.

---

## 5. System Directory Structure

```
project-root/
├── public/
│   ├── favicon.svg              # Placeholder vector favicon
│   ├── robots.txt               # Search crawler directives
│   └── sitemap.xml              # XML URL catalog
│
├── src/
│   ├── config/
│   │   ├── brandConfig.js       # Centralized brand, logo, and domain settings
│   │   └── seoConfig.js         # Page metadata, titles, descriptions, and JSON-LD schemas
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Unheic-style sticky navigation with tool tabs & CTA
│   │   │   ├── Footer.jsx       # Clean multi-column footer with internal link graph
│   │   │   ├── MainLayout.jsx   # Shared layout wrapper (Header + Content + Footer)
│   │   │   └── SeoHead.jsx      # Dynamic React Helmet + JSON-LD injector
│   │   │
│   │   ├── shared/
│   │   │   ├── Dropzone.jsx     # Unheic-styled dashed upload zone (drag-and-drop / click)
│   │   │   ├── FileSwitcherBar.jsx # Horizontal thumbnail pills for active batch files
│   │   │   ├── HowItWorksStrip.jsx # 4-step workflow process strip
│   │   │   ├── FeatureGrid.jsx  # 9-card utility feature directory
│   │   │   ├── FootprintMatrix.jsx # AI Generator footprint detection matrix
│   │   │   └── FaqAccordion.jsx # Expandable Q&A accordion list
│   │   │
│   │   └── tools/               # Skeleton UI (Phase 1) & Tool Logic (Phase 2)
│   │       ├── FileQueueRow.jsx # Uploaded file queue row with risk badges & buttons
│   │       ├── MetadataInspector.jsx # Split-view tag inspector table (view mode)
│   │       ├── MetadataEditorForm.jsx # EXIF & camera spoofing form (edit mode)
│   │       ├── MapPicker.jsx    # Leaflet interactive map & coordinate inputs (geotag mode)
│   │       └── TextSanitizer.jsx # Dual-pane text cleaner with character counters
│   │
│   ├── context/
│   │   └── WorkspaceContext.jsx # Cross-tool batch state (up to 5 files / 100 MB) & RAM cleanup
│   │
│   ├── pages/                   # The 6 Dedicated SEO Routes
│   │   ├── RemoveMetadataPage.jsx    # Route: /
│   │   ├── ViewMetadataPage.jsx      # Route: /view-metadata
│   │   ├── EditMetadataPage.jsx      # Route: /edit-metadata
│   │   ├── GeoTagPage.jsx            # Route: /geo-tag-photo
│   │   ├── AiTextCleanerPage.jsx     # Route: /ai-text-cleaner
│   │   └── InstagramGuidePage.jsx    # Route: /instagram-ai-label-guide
│   │
│   ├── services/                # Phase 2: Binary & Client-Side Processing Engines
│   │   ├── fileValidation.js    # Magic-byte format detection (JPEG, PNG, WebP)
│   │   ├── metadataScanner.js   # exifr + custom C2PA JUMBF / PNG chunk parser
│   │   ├── losslessStripper.js  # Binary header slicing (APP1, APP11, eXIf, tEXt)
│   │   ├── exifWriter.js        # piexifjs EXIF/GPS binary serializer
│   │   ├── textCleaner.js       # Zero-width & Unicode watermark sanitizer
│   │   └── zipService.js        # JSZip client-side batch packaging
│   │
│   ├── styles/
│   │   └── index.css            # Tailwind directives + Unheic color variables
│   │
│   ├── App.jsx                  # React Router configuration
│   └── main.jsx                 # Application entry point with HelmetProvider
│
├── index.html                   # HTML shell with Google fonts preconnected
├── tailwind.config.js           # Design tokens, fonts, and responsive breakpoints
├── vite.config.js               # Vite build config & code splitting
└── package.json
```

---

## 6. State Architecture (`WorkspaceContext`)

To allow seamless navigation across all 5 tools without re-uploading files, state is partitioned into:
1. **Global Shared State (`WorkspaceContext`):** Holds up to 5 files (100 MB max aggregate), parsed metadata, active file pointer, and sanitized blobs.
2. **Local Component State (`useState`):** Isolates ephemeral UI states (search inputs, active tab filters, accordion expansions) to avoid unnecessary global re-renders.

```typescript
interface FileEntry {
  id: string;                    // `${filename}-${timestamp}-${random5}`
  originalFile: File;            // Native browser File instance
  previewUrl: string;            // Created via URL.createObjectURL(file)
  name: string;                  // Original filename
  size: number;                  // Size in bytes
  type: string;                  // MIME type ("image/jpeg", "image/png", etc.)
  dimensions: { width: number; height: number } | null;
  status: 'uploaded' | 'scanning' | 'ready' | 'processing' | 'cleaned' | 'edited' | 'error';
  aiRisk: 'high' | 'medium' | 'none';
  detectedAiSignals: string[];   // e.g., ["C2PA Claim Generator", "XMP: Adobe Firefly"]
  metadata: {
    c2pa: Record<string, any>;
    exif: Record<string, any>;
    iptc: Record<string, any>;
    xmp: Record<string, any>;
    gps: { latitude: number | null; longitude: number | null; altitude: number | null } | null;
    totalTagCount: number;
  } | null;
  cleanedBlob: Blob | null;
  cleanedUrl: string | null;     // Created via URL.createObjectURL(cleanedBlob)
}
```

### Memory Leak Prevention
Whenever files are removed (`removeFileItem(id)` or `clearAllFiles()`), the context executes:
```javascript
URL.revokeObjectURL(entry.previewUrl);
if (entry.cleanedUrl) URL.revokeObjectURL(entry.cleanedUrl);
```
This guarantees browser memory (RAM) is instantly freed.

---

## 7. Two-Phase Implementation Methodology

### Phase 1: Skeletal System First (Current Phase)
1. Initialize project structure, Tailwind configuration, and `brandConfig.js`.
2. Build global layouts (`Navbar`, `Footer`, `MainLayout`, `SeoHead`).
3. Build page skeletons one by one:
   - User provides full-page screenshot of DeleteFootprints page.
   - Extract exact structure, sections, features, and text.
   - Implement the page styled according to the clean Unheic.io design system.

### Phase 2: Engine Integration (Client-Side Logic)
1. Implement magic-byte validation (`0xFFD8` for JPEG, `0x89504E47` for PNG, `RIFF...WEBP` for WebP).
2. Implement binary header stripper (`losslessStripper.js`) for zero-pixel degradation.
3. Implement `exifr` + custom parser for deep tag inspection (`metadataScanner.js`).
4. Implement `piexifjs` for EXIF spoofing and Leaflet map GPS tagging.
5. Implement zero-width space sanitizer engine for AI text cleaning.
6. Verify client-side ZIP packaging and batch download via `JSZip`.
