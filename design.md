# Design System Specification: CleanAIMetadata Suite (Authentic Unheic.io Skin)

## 1. Design Philosophy & North Star

### "Minimalist Swiss Tech Utility"
The visual identity is extracted directly from **Unheic.io's** live production CSS stylesheet (`3mt33179fb2mi.css`): a utilitarian, distraction-free aesthetic built for speed, privacy, and technical confidence.

- **Utilitarian Elegance:** Generous whitespace, centered containers, and clean 1px borders.
- **Zero Distraction:** No heavy gradients, no gaudy drop-shadows, no floating promotional banners, and no intrusive ads above the fold.
- **Organic Tech Palette:** A soft sage/mint tinted canvas (`#f4f7f3`) rather than harsh sterile white or cold blue-gray, paired with deep forest spruce green accents (`#08705a`, `#045242`).
- **High-Trust Status Badges:** Statuses are communicated with crisp semantic color pills (Green = Clean, Amber = Camera/GPS Warning, Red = AI Detected).
- **Typography:** Modern Swiss sans-serif typography (`Geist` / `Inter`) paired with monospaced data values (`Geist Mono` / `JetBrains Mono`) for technical precision.

---

## 2. Color Palette & Design Tokens (Extracted Directly from Unheic.io)

### 2.1 Core Neutral & Surface Tokens
| Token Role | Hex Code | Tailwind Class | Application |
|---|---|---|---|
| **Page Canvas** | `#f4f7f3` | `bg-canvas` | Soft sage-tinted off-white background providing high-contrast separation for white cards. |
| **Card & Navbar** | `#ffffff` | `bg-white` | Pure white container cards, sticky navbar, inspector tables, FAQ cards. |
| **Surface Raised** | `#f9fbf8` | `bg-card-raised` | Subtle raised card surfaces and inactive pills. |
| **Surface Strong** | `#e9f0ec` | `bg-card-strong` | Active segmented pill container background and hover states. |
| **Subtle Border (`--line`)** | `#d5e0da` | `border-subtle` | Crisp 1px structural borders across all cards, dividers, and tables. |
| **Border Active (`--line-strong`)**| `#aebfb6` | `border-subtle-hover` | Interactive card hover borders and active input states. |
| **Primary Text (`--foreground`)** | `#10201c` | `text-foreground` | Deep spruce slate / near-black headings, filenames, and active links. |
| **Secondary Text (`--muted`)** | `#5a6b65` | `text-muted` | Subtitles, helper text, FAQ answers, metadata labels. |
| **Strong Label (`--muted-strong`)**| `#344a43` | `text-muted-strong`| Form labels, table headers, and emphasized captions. |

### 2.2 Brand & Interactive Tokens (Unheic Signature Spruce Green)
| Token Role | Hex Code | Tailwind Class | Application |
|---|---|---|---|
| **Brand Primary (`--brand`)** | `#08705a` | `text-brand bg-brand` | Signature spruce green: Eyebrow dot indicators, active links, checkmarks. |
| **Brand Strong (`--brand-strong`)**| `#045242` | `bg-brand-strong text-white` | Deep dark forest spruce for primary CTAs (*Remove All Metadata*, *Save & Download*, *Instagram AI Fix*). |
| **Brand Soft (`--brand-soft`)** | `#dff4ec` | `bg-brand-soft text-brand` | Soft mint background for active navigation pills and status badges. |

### 2.3 Semantic Status & Risk Tokens
| Status Level | Text Color | Background | Border | Application |
|---|---|---|---|---|
| **AI Alert (High Risk)** | `#b42318` (`text-risk-rose-text`) | `#fee4e2` (`bg-risk-rose-bg`) | `#fecdca` | Badges and alerts when C2PA, Midjourney, DALL-E, or Firefly tags are present. |
| **Privacy / GPS Warning** | `#b34423` (`text-risk-amber-text`) | `#ffeadf` (`bg-risk-amber-bg`)| `#fecdba` | Badges when GPS coordinates, serial numbers, or camera EXIF are detected. |
| **Verified Clean** | `#087443` (`text-risk-emerald-text`)| `#dcfae6` (`bg-risk-emerald-bg`)| `#abefc6` | "0 Footprints Found · Verified Clean" status pill and download readiness. |

---

## 3. Typography System

### 3.1 Font Families
- **Primary Interface Font:** `'Geist'`, `'Inter'`, system-ui, sans-serif.
- **Monospaced Data Font:** `'Geist Mono'`, `'JetBrains Mono'`, monospace.

### 3.2 Type Hierarchy Scale
- **Display Hero H1:** `text-3xl sm:text-5xl font-bold tracking-tight text-foreground`
- **Section H2:** `text-2xl sm:text-3xl font-bold tracking-tight text-foreground`
- **Card Title H3:** `text-base sm:text-lg font-semibold text-foreground`
- **Eyebrow Tags:** `text-xs font-mono font-semibold uppercase tracking-wider text-brand`
- **Body Large:** `text-base sm:text-lg text-muted leading-relaxed`
- **Body Standard:** `text-sm text-muted leading-relaxed`
- **Technical Monospace:** `font-mono text-xs text-muted-strong`
