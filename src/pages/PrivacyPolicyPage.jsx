import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Cookie,
  Globe2,
  Trash2,
  Baby,
  Scale,
  ServerOff,
  FileText,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { BRAND_CONFIG } from '../config/brandConfig';

const LAST_UPDATED = 'November 12, 2026';
const EFFECTIVE_DATE = 'November 1, 2026';

export default function PrivacyPolicyPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy | ${BRAND_CONFIG.name}`,
    description:
      'How our 100% client-side privacy architecture handles your data: no server uploads, no analytics, no cookies, and no third-party tracking.',
    url: `${BRAND_CONFIG.canonicalBase}/privacy`,
  };

  return (
    <div className="w-full">
      <SeoHead
        title={`Privacy Policy | ${BRAND_CONFIG.name}`}
        description="Learn how our 100% client-side privacy architecture handles your data. No server uploads, no analytics, no cookies, no third-party requests."
        canonical={`${BRAND_CONFIG.canonicalBase}/privacy`}
        schemaJson={pageSchema}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ZERO-KNOWLEDGE ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-[42px] font-bold tracking-tight text-foreground leading-tight">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            This policy explains what data we process, where it lives, and why we never see your
            files.
          </p>
          <p className="text-xs text-muted font-mono">
            Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE} · Version{' '}
            {BRAND_CONFIG.version}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Executive Summary */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                1. Executive Summary
              </h2>
              <div className="space-y-3 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  <strong className="text-foreground">{BRAND_CONFIG.name}</strong> is a{' '}
                  <strong className="text-foreground">100% client-side privacy suite</strong>. Your
                  images and text never leave your browser. We operate no upload endpoints, no
                  processing servers, no analytics pipelines, and no user accounts.
                </p>
                <ul className="space-y-2.5 list-none pl-0">
                  <li className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Zero bytes uploaded.</strong> All binary
                      operations — JPEG/PNG/WebP container slicing, EXIF/IPTC/XMP/C2PA parsing, GPS
                      tag writing, and text sanitization — execute on an{' '}
                      <code className="font-mono text-xs bg-card-strong px-1.5 py-0.5 rounded">
                        ArrayBuffer
                      </code>{' '}
                      inside your browser tab.
                    </span>
                  </li>
                  <li className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Zero tracking.</strong> No Google
                      Analytics, no advertising pixels, no session replay, no fingerprinting. The
                      only network requests are for the static assets that render this site.
                    </span>
                  </li>
                  <li className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Zero persistence.</strong> Closing the tab
                      destroys all in-memory state. We use no localStorage, no IndexedDB, and no
                      service worker caching for your files.
                    </span>
                  </li>
                  <li className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Zero accounts.</strong> No email capture,
                      no authentication, no subscription tiers. Every tool is free and unrestricted.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 2. Data We Process Locally */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Local Processing Only</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  2. Data We Process
                </h2>
              </div>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                When you use a tool, the following data exists{' '}
                <strong className="text-foreground">only in your browser memory</strong> for the
                duration of your session:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-subtle bg-canvas space-y-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand" />
                    Image files
                  </h3>
                  <ul className="space-y-1 text-xs text-muted leading-relaxed list-disc pl-4">
                    <li>Raw file bytes used for format detection</li>
                    <li>Parsed metadata (EXIF, IPTC, XMP, C2PA/JUMBF, GPS)</li>
                    <li>Modified byte buffers created when you export</li>
                  </ul>
                  <p className="text-[11px] font-mono text-emerald-600 pt-1">
                    Never transmitted · Destroyed on tab close
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-subtle bg-canvas space-y-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan" />
                    Text input
                  </h3>
                  <ul className="space-y-1 text-xs text-muted leading-relaxed list-disc pl-4">
                    <li>Plain text you paste or type</li>
                    <li>Character-level analysis results (invisible Unicode, AI tags)</li>
                    <li>Cleaned output generated for copy or download</li>
                  </ul>
                  <p className="text-[11px] font-mono text-emerald-600 pt-1">
                    Never transmitted · Destroyed on tab close
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 p-3.5 rounded-xl border border-subtle bg-card-strong text-xs text-muted-strong leading-relaxed">
                <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>
                  There is no API endpoint, upload handler, or cloud worker behind these tools.
                  Nothing you open in this site is sent anywhere for processing.
                </span>
              </div>
            </section>

            {/* 3. Network Requests */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Globe2 className="w-4 h-4" />
                <span>No Hidden Beacons</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                3. Network Requests
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                This is the exhaustive list of outbound requests a browser can make while using
                this site. You can verify it yourself in DevTools → Network.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[540px]">
                  <thead>
                    <tr className="border-b border-subtle text-muted font-semibold">
                      <th className="pb-2 pr-4">Request</th>
                      <th className="pb-2 pr-4">Purpose</th>
                      <th className="pb-2">Contains your data?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-brand">JS / CSS bundles</td>
                      <td className="py-2.5 pr-4 text-muted">Application code (Vite build)</td>
                      <td className="py-2.5 font-mono text-emerald-600">No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-brand">Google Fonts</td>
                      <td className="py-2.5 pr-4 text-muted">Inter &amp; JetBrains Mono typography</td>
                      <td className="py-2.5 font-mono text-emerald-600">No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-brand">Favicon / manifest / robots.txt</td>
                      <td className="py-2.5 pr-4 text-muted">Browser and SEO assets</td>
                      <td className="py-2.5 font-mono text-emerald-600">No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-brand">OpenStreetMap embed</td>
                      <td className="py-2.5 pr-4 text-muted">
                        Geo Tag page only, after you click “Load the map”
                      </td>
                      <td className="py-2.5 font-mono text-amber-600">
                        Viewport coords + IP
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-brand">Nominatim search</td>
                      <td className="py-2.5 pr-4 text-muted">
                        Geo Tag page only, after you submit a place search
                      </td>
                      <td className="py-2.5 font-mono text-amber-600">Search query + IP</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted leading-relaxed pt-1">
                <strong className="text-foreground">No other requests.</strong> No analytics, no
                error reporting (Sentry, LogRocket), no feature flags, no A/B testing, no embedded
                widgets, and no advertising networks.
              </p>
            </section>

            {/* 4. Cookies & Local Storage */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Cookie className="w-4 h-4" />
                <span>Storage Audit</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                4. Cookies &amp; Local Storage
              </h2>
              <ul className="divide-y divide-subtle text-sm">
                <li className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Cookies</p>
                    <p className="text-xs text-muted">No first-party or third-party cookies are set.</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 shrink-0 py-0.5">None</span>
                </li>
                <li className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">localStorage / sessionStorage</p>
                    <p className="text-xs text-muted">Nothing is written to browser storage keys.</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 shrink-0 py-0.5">None</span>
                </li>
                <li className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">IndexedDB</p>
                    <p className="text-xs text-muted">No client-side database is created.</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 shrink-0 py-0.5">None</span>
                </li>
                <li className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Service workers / cache API</p>
                    <p className="text-xs text-muted">
                      None registered. Static assets use ordinary HTTP caching headers.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 shrink-0 py-0.5">None</span>
                </li>
              </ul>
              <p className="text-xs text-muted leading-relaxed">
                Open DevTools → Application → Storage and every category will show{' '}
                <code className="font-mono bg-card-strong px-1.5 py-0.5 rounded">0 bytes</code> for
                this origin.
              </p>
            </section>

            {/* 5. Third-Party Services */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                5. Third-Party Services
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                We integrate no third-party services into the core privacy tools. The only optional
                third-party interaction is on the{' '}
                <Link to="/geo-tag-photo" className="text-brand font-semibold hover:underline">
                  Geo Tag Photo
                </Link>{' '}
                page:
              </p>
              <ul className="space-y-3 text-sm text-muted-strong leading-relaxed">
                <li className="p-3.5 rounded-xl border border-subtle bg-canvas">
                  <p className="font-semibold text-foreground">OpenStreetMap (openstreetmap.org)</p>
                  <p className="text-xs text-muted mt-1">
                    Map tiles load only after you click “Load the map”. Your IP address and the
                    coordinates of the viewport are sent to the OpenStreetMap Foundation under their{' '}
                    <a
                      href="https://operations.osmfoundation.org/policies/tiles/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Tile Usage Policy
                    </a>
                    .
                  </p>
                </li>
                <li className="p-3.5 rounded-xl border border-subtle bg-canvas">
                  <p className="font-semibold text-foreground">
                    Nominatim (nominatim.openstreetmap.org)
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Place-name lookups are sent only when you submit a search. Your query string and
                    IP address are sent under their{' '}
                    <a
                      href="https://operations.osmfoundation.org/policies/nominatim/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Usage Policy
                    </a>
                    .
                  </p>
                </li>
              </ul>
              <p className="text-xs text-muted leading-relaxed">
                Both services are <strong className="text-foreground">opt-in by interaction</strong>{' '}
                — nothing fires until you load the map or submit a search. Every other tool makes{' '}
                <strong className="text-foreground">zero</strong> third-party requests.
              </p>
            </section>

            {/* 6. Retention */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Trash2 className="w-4 h-4" />
                <span>Tab Close = Gone</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                6. Data Retention &amp; Deletion
              </h2>
              <ul className="space-y-2.5 text-sm text-muted-strong leading-relaxed list-disc pl-5">
                <li>
                  <strong className="text-foreground">In memory (RAM):</strong> File bytes and text
                  exist only while the tab is open. Closing the tab or navigating away releases them
                  immediately.
                </li>
                <li>
                  <strong className="text-foreground">Downloads:</strong> Exporting creates a Blob
                  and triggers the browser’s normal save dialog. The file lands in your own downloads
                  folder; we have no access to it.
                </li>
                <li>
                  <strong className="text-foreground">Clipboard:</strong> Copy actions use the
                  standard Clipboard API. We never read or monitor clipboard contents.
                </li>
                <li>
                  <strong className="text-foreground">Server logs:</strong> We operate no processing
                  server, so no logs of your files can exist. Our CDN records only ordinary static
                  asset requests (IP, path, timestamp) per standard HTTP practice.
                </li>
              </ul>
            </section>

            {/* 7. Children's Privacy */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Baby className="w-4 h-4" />
                <span>COPPA &amp; GDPR-K</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                7. Children’s Privacy
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                This site is not directed at children under 13 (or under 16 in the EEA and UK). We
                do not knowingly collect personal information from anyone. Because we collect no
                personal information at all — no accounts, no emails, no analytics, no uploads —
                COPPA, GDPR-K, and comparable rules are satisfied by the architecture itself.
              </p>
            </section>

            {/* 8. Your Rights */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>GDPR · CCPA · LGPD</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                8. Your Rights
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                Because we hold no personal data on any server, your statutory rights are fulfilled
                by design:
              </p>
              <ul className="space-y-2.5 text-sm text-muted-strong leading-relaxed list-disc pl-5">
                <li>
                  <strong className="text-foreground">Access:</strong> every byte we “process” is
                  already visible to you in the interface.
                </li>
                <li>
                  <strong className="text-foreground">Rectification:</strong> edit your text or load
                  a different image at any time.
                </li>
                <li>
                  <strong className="text-foreground">Erasure:</strong> close the tab and all
                  in-memory data is destroyed.
                </li>
                <li>
                  <strong className="text-foreground">Portability:</strong> use the download or copy
                  buttons to export your results.
                </li>
                <li>
                  <strong className="text-foreground">Restriction / objection:</strong> not
                  applicable — there is no profiling, no automated decision-making, and no marketing.
                </li>
              </ul>
              <p className="text-xs text-muted leading-relaxed">
                For any regulatory inquiry, write to{' '}
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="text-brand hover:underline"
                >
                  {BRAND_CONFIG.supportEmail}
                </a>
                .
              </p>
            </section>

            {/* 9. Security */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <ServerOff className="w-4 h-4" />
                <span>Minimal Attack Surface</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                9. Security
              </h2>
              <ul className="space-y-2.5 text-sm text-muted-strong leading-relaxed list-disc pl-5">
                <li>
                  <strong className="text-foreground">Transport:</strong> all assets are served over
                  HTTPS and modern TLS.
                </li>
                <li>
                  <strong className="text-foreground">Dependencies:</strong> a small, audited
                  dependency tree. No remote code is fetched or evaluated at runtime.
                </li>
                <li>
                  <strong className="text-foreground">No server attack surface:</strong> there are no
                  API endpoints, no database, no authentication logic, and no upload handlers to
                  exploit.
                </li>
                <li>
                  <strong className="text-foreground">Data minimization by construction:</strong> the
                  strongest protection available is never receiving your data in the first place.
                </li>
              </ul>
            </section>

            {/* 10. Changes */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                10. Changes to This Policy
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                We may update this policy when the architecture changes — for example, if a new tool
                is added or a third-party provider is replaced. Material changes are reflected in
                the <strong className="text-foreground">Last updated</strong> date at the top of this
                page. Continued use of the site after an update constitutes acceptance of the revised
                policy.
              </p>
            </section>

            {/* 11. Contact */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                11. Contact
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                Questions, complaints, or regulatory requests can be sent to:
              </p>
              <div className="p-4 rounded-xl border border-subtle bg-canvas">
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline font-mono"
                >
                  <Mail className="w-4 h-4" />
                  <span>{BRAND_CONFIG.supportEmail}</span>
                </a>
                <p className="text-xs text-muted mt-1.5 font-mono">
                  {BRAND_CONFIG.name} · {BRAND_CONFIG.domain}
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* At a glance */}
            <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-4">
              <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                Policy at a Glance
              </h3>
              <dl className="divide-y divide-subtle text-xs">
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Effective</dt>
                  <dd className="font-mono text-foreground text-right">{EFFECTIVE_DATE}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Last updated</dt>
                  <dd className="font-mono text-foreground text-right">{LAST_UPDATED}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Server uploads</dt>
                  <dd className="font-mono text-emerald-600 font-bold">0 bytes</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Cookies</dt>
                  <dd className="font-mono text-emerald-600 font-bold">None</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Accounts</dt>
                  <dd className="font-mono text-emerald-600 font-bold">None</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Processing</dt>
                  <dd className="font-mono text-brand font-bold">In-browser</dd>
                </div>
              </dl>
            </div>

            {/* Related legal */}
            <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Related Pages</span>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/terms"
                    className="inline-flex items-center gap-1.5 text-foreground font-semibold hover:text-brand transition-colors"
                  >
                    <span>Terms of Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1.5 text-foreground font-semibold hover:text-brand transition-colors"
                  >
                    <span>About the Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guarantee card */}
            <div className="bg-navy rounded-panel p-6 text-white space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan" />
                <span className="text-xs font-mono text-cyan font-bold uppercase tracking-wider">
                  Verify It Yourself
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Open DevTools → Network, then run any tool. You will see no request carrying your
                file or text. Everything happens in the tab.
              </p>
              <div className="pt-1">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan hover:underline"
                >
                  <span>Try a tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
