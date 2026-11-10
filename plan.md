# Master Implementation Plan: AI Metadata Eraser Suite

## High-Level Vision & Guiding Rules
1. **Skeleton First, Functionality Second:** Build the complete visual frontend, page structure, responsive layouts, and mock components first across all pages. Binary processing, tag parsing, coordinate manipulation, and metadata math are wired in Phase 4 once the UI skeleton is validated.
2. **3-Way Page Comparison Workflow:** Before implementing each page:
   - **Step A:** User uploads the full-page screenshot of that page from **DeleteFootprints.ai**.
   - **Step B:** Antigravity inspects the screenshot (extracting all features, sections, copy, and controls).
   - **Step C:** Antigravity compares it directly with the **Stitch-generated screen** in `stitch_cleanaimetadata_privacy_suite/` (extracting layout elements while purging any warm/retro "Terra" design artifacts).
   - **Step D:** Antigravity implements that page combining DeleteFootprints' complete feature set dressed in **Unheic.io’s** crisp, minimalist light-mode aesthetic.
3. **100% Client-Side Privacy:** Zero server uploads. All processing in-browser (`ArrayBuffer`, `DataView`, `Blob`).
4. **Extreme SEO Engine:** High-intent keywords, semantic HTML hierarchy, dynamic JSON-LD (`WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`), and high Core Web Vitals (>95 Lighthouse).
5. **Modular Placeholder Branding:** Single-source brand config (`src/config/brandConfig.js`) for instant 1-click rebranding.

---

## Phase 1: Foundation & Project Scaffolding
- [x] **Step 1.1: Project Initialization**
  - Initialize Vite + React 18 SPA.
  - Install dependencies: `tailwindcss`, `lucide-react`, `react-router-dom`, `react-helmet-async`, `clsx`, `tailwind-merge`.
  - Configure `tailwind.config.js` with Unheic.io design tokens (`bg-slate-50`, `border-slate-200`, `text-slate-900`, `bg-blue-600`), Inter typography, and crisp border radiuses.
  - Set up `index.html` with Google Fonts preconnect (`Inter`, `JetBrains Mono`) and base meta tags.
- [x] **Step 1.2: Brand & SEO Configuration Layer**
  - Create `src/config/brandConfig.js` (placeholder app name, logo, domain, and contact info).
  - Create `src/config/seoConfig.js` (route metadata, titles, descriptions, canonical URLs, and structured data schemas).
- [x] **Step 1.3: Global State & Memory Skeleton**
  - Create `src/context/WorkspaceContext.jsx` with 5-file capacity (100 MB max), active file selection, and memory cleanup (`URL.revokeObjectURL`).
- [x] **Step 1.4: Global Layout Shell**
  - Create `src/components/layout/Navbar.jsx` (sticky Unheic header, brand logo + `• LOCAL PRIVACY ENGINE` tag, 5-tool segmented pill nav, dark `Instagram AI Fix →` CTA).
  - Create `src/components/layout/Footer.jsx` (Unheic 4-column layout: *Convert & Clean*, *Inspect*, *Understand*, *Project*, copyright & zero-server pledge).
  - Create `src/components/layout/MainLayout.jsx` and `SeoHead.jsx`.

---

## Phase 2: Page-by-Page Skeletal Build (3-Way Inspection Workflow)

### Page 1: Remove AI Metadata (Route: `/`)
- [x] **Step 2.1: Inspection & Comparison**
  - Inspect `02_home_empty_and_steps.png` (already provided).
  - Compare against `stitch_cleanaimetadata_privacy_suite/remove_ai_metadata/screen.png`.
- [x] **Step 2.2: Skeleton Build**
  - Centered hero with eyebrow `• PRIVATE QUICK CONVERT`, title `Remove AI label metadata from images.`, and 3 trust bullets.
  - Target format switcher (`JPG`, `PNG`, `WebP`, `HEIC`, `TIFF`).
  - Dashed dropzone with file drag/drop, `Choose Images` button, and `Try demo AI photo` action.
  - Upload queue row with risk badges (Rose for AI, Amber for EXIF, Green for Clean) and batch action bar.
  - 4-step process strip (`01 Inspect`, `02 Scan`, `03 Strip Losslessly`, `04 Verify Clean`).
  - 9 Feature Directory cards with monochrome icons and exact DeleteFootprints copy.
  - Verification Policy Table ("What survives the browser path?").
  - SEO educational deep-dive sections + 10 expandable FAQ accordions.

### Page 2: View Image Metadata (Route: `/view-metadata`)
- [x] **Step 2.3: Inspection & Comparison**
  - User uploads full-page DeleteFootprints View Metadata screenshot.
  - Inspect uploaded screenshot and compare against `stitch_cleanaimetadata_privacy_suite/view_image_metadata/screen.png`.
- [x] **Step 2.4: Skeleton Build**
  - Top active file switcher carousel (thumbnail pills).
  - Left pane: photo preview, file specs, and AI Detection Risk Card.
  - Right pane: category filter pills (`All`, `AI/C2PA`, `EXIF`, `IPTC`, `XMP`, `GPS`), live search input, Copy JSON / Export CSV buttons, and monospace key-value inspection table.

### Page 3: Edit Image Metadata (Route: `/edit-metadata`)
- [x] **Step 2.5: Inspection & Comparison**
  - User uploads full-page DeleteFootprints Edit Metadata screenshot.
  - Inspect uploaded screenshot and compare against `stitch_cleanaimetadata_privacy_suite/edit_image_metadata/screen.png`.
- [x] **Step 2.6: Skeleton Build**
  - Left pane: Photo preview, Quick Presets Card (*Clear All AI Tags*, *DSLR Canon EOS R5*, *iPhone 15 Pro*), and Mode Selection switcher (*Remove Existing Metadata* vs *Keep and Overwrite*).
  - Right pane: Grouped form fields for Creator & Copyright, Device & Software, and Timestamps.
  - Below the fold: 5-step guide, mode comparison table, field dictionary, and 6 dedicated FAQ accordions.

### Page 4: Geo Tag Photo (Route: `/geo-tag-photo`)
- [x] **Step 2.7: Inspection & Comparison**
  - User uploads full-page DeleteFootprints Geo Tag Photo screenshot.
  - Inspect uploaded screenshot and compare against `stitch_cleanaimetadata_privacy_suite/geo_tag_photo/screen.png`.
- [x] **Step 2.8: Skeleton Build**
  - Left pane: Interactive map container with OpenStreetMap search bar, draggable pin, and quick preset location chips.
  - Right pane: Photo preview, GPS status pill (`GPS Active` vs `No GPS in File`), Latitude, Longitude, Altitude, Direction, and "Remove All Other Metadata" toggle.
  - Actions: *Save & Download Geotagged Image* and *Remove Location Data Only*.
  - Below the fold: Coordinate extraction guide (Mobile & PC) with NOTE callout, and 5 dedicated GeoTag FAQs.

### Page 5: AI Text Watermark Cleaner (Route: `/ai-text-cleaner`)
- [x] **Step 2.9: Inspection & Comparison**
  - User uploads full-page DeleteFootprints AI Text Cleaner screenshot.
  - Inspect uploaded screenshot and compare against `stitch_cleanaimetadata_privacy_suite/ai_text_watermark_cleaner/screen.png`.
- [x] **Step 2.10: Skeleton Build**
  - Rule toggle bar (strip zero-width spaces, normalize non-breaking spaces, replace em-dashes, convert smart quotes).
  - Side-by-side dual textareas: Left raw input with live detection counters; Right clean output with 0-footprint badge, Copy button, and `.txt` export.
  - Below the fold: 8-card feature directory, educational guide on hidden Unicode characters vs token watermarking, and 5 dedicated FAQs.

### Page 6: Instagram AI Label Guide (Route: `/instagram-ai-label-guide`)
- [ ] **Step 2.11: Inspection & Comparison**
  - User uploads full-page DeleteFootprints Instagram Guide screenshot.
- [ ] **Step 2.12: Skeleton Build**
  - Top embedded quick dropzone routing directly into the cleaner workspace.
  * Step-by-step visual guide explaining why Meta flags photos, export settings in Lightroom/Photoshop, and how to verify before posting.

---

## Phase 3: SEO Polish & Static Assets
- [ ] **Step 3.1: Public Directory SEO Files**
  - `public/robots.txt` (permissive crawler access).
  - `public/sitemap.xml` (all 6 routes with priority and change frequencies).
  - `public/favicon.svg` (crisp placeholder vector icon).
- [ ] **Step 3.2: Structured Data Verification**
  - Verify JSON-LD schemas inject correctly for all pages (`WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`).
- [ ] **Step 3.3: Canonical Tag & Social Sharing Cards**
  - OpenGraph and Twitter Card social sharing cards across all routes.

---

## Phase 4: Functionality & Binary Engine Wiring
- [x] **Step 4.1: Magic-Byte & Format Validation**
  - `fileValidation.js` inspecting byte headers (`0xFFD8` for JPEG, `0x89504E47` for PNG, `RIFF...WEBP` for WebP).
- [x] **Step 4.2: Lossless Binary Stripper**
  - Slicing `APP1`, `APP11`, `APP13` in JPEG; ancillary chunks in PNG; EXIF/XMP in WebP. Zero canvas re-compression.
  - ICC colour profile (`APP2 ICC_PROFILE`, PNG `iCCP`, WebP `ICCP`) is preserved on every format.
  - TIFF / HEIC / AVIF fall back to a canvas re-encode when the browser can decode them (marked "re-encoded" in the UI).
- [x] **Step 4.3: Deep Metadata Scanner**
  - `exifr` + custom JUMBF/C2PA signatures extracting tags into the View inspector and the inline `MetadataPreview`.
- [ ] **Step 4.4: EXIF & GPS Writer**
  - `piexifjs` encoding for metadata editing and Leaflet GPS coordinate tagging.
- [ ] **Step 4.5: Regex Text Sanitizer Engine**
  - Zero-width character stripping and Unicode punctuation normalization.
- [x] **Step 4.6: Batch Archiver**
  - `jszip` packaging up to 5 cleaned images into a single `.zip` download (dynamically imported).

---

## Phase 5: Testing, Memory Leak Audit & Deployment
- [ ] **Step 5.1: Cross-Format QA**
  - Test JPEG, PNG, WebP, TIFF, and HEIC across all tools.
- [ ] **Step 5.2: Memory Leak & Object URL Verification**
  - Verify `URL.revokeObjectURL()` triggers on file removal and replacement.
- [ ] **Step 5.3: Lighthouse Audit**
  - Target >95 across Performance, Accessibility, Best Practices, and SEO.
