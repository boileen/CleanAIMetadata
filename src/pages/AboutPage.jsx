import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  Lock,
  FileCheck2,
  AlertCircle,
  Mail,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { BRAND_CONFIG } from '../config/brandConfig';

export default function AboutPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${BRAND_CONFIG.name}`,
    description:
      'Learn about our 100% client-side privacy architecture, lossless metadata engine, and local-first data processing principles.',
    url: `${BRAND_CONFIG.canonicalBase}/about`,
  };

  return (
    <div className="w-full">
      <SeoHead
        title={`About ${BRAND_CONFIG.name} — 100% Client-Side Privacy Architecture`}
        description="Learn how our privacy lab operates with 100% in-browser processing, lossless header stripping, and zero remote data storage."
        canonical={`${BRAND_CONFIG.canonicalBase}/about`}
        schemaJson={pageSchema}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LOCAL PRIVACY ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-[42px] font-bold tracking-tight text-foreground leading-tight">
            About <span className="text-brand">{BRAND_CONFIG.name}</span>
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            We built a local-first privacy suite designed to inspect, edit, and sanitize image metadata without ever transmitting your files to a cloud server.
          </p>
        </div>

        {/* Main Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 8-Column Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Core Mission Panel */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Our Architectural Philosophy
              </h2>
              <div className="space-y-4 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  Most online image cleaners and metadata removers operate on a legacy server-upload model: you upload your private photo to a remote cloud worker, the server processes it with tools like ExifTool, and you download it back. Even when sites claim files are deleted within 30 minutes, your personal photos still travel across third-party networks and sit in temporary server storage.
                </p>
                <p>
                  <strong className="text-foreground">We fundamentally reject that model.</strong> {BRAND_CONFIG.name} is engineered to run <strong>100% inside your local browser memory</strong> using modern WebAssembly and JavaScript binary decoders. When you drop an image onto our tools, it never leaves your machine. Your network activity remains completely quiet, and your photos remain strictly private.
                </p>
              </div>
            </section>

            {/* How We Handle Your Files Panel */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Zero-Knowledge Processing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                How We Handle Your Files
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-subtle bg-canvas space-y-1.5">
                  <span className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    No Server Uploads
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    Binary byte operations are executed directly on an ArrayBuffer in your browser tab.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-subtle bg-canvas space-y-1.5">
                  <span className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    No AI Training
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    Because we cannot see your images, they can never be scraped or used to train generative AI models.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-subtle bg-canvas space-y-1.5">
                  <span className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    No Accounts or Logins
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    All tools are free, unrestricted, and require no account creation, email capture, or subscription.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-subtle bg-canvas space-y-1.5">
                  <span className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    Lossless Pixel Stream
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    We slice container headers (EXIF, XMP, C2PA) without decoding or re-compressing your image pixels.
                  </p>
                </div>
              </div>
            </section>

            {/* What the Tools Do Panel */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Our Core Privacy Tools
              </h2>
              <ul className="divide-y divide-subtle text-sm">
                <li className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Link to="/" className="font-bold text-foreground hover:text-brand transition-colors">
                      Remove Metadata →
                    </Link>
                    <p className="text-xs text-muted">Losslessly strip C2PA, camera EXIF, IPTC, and GPS tags.</p>
                  </div>
                  <span className="text-[11px] font-mono text-brand bg-brand-soft px-2 py-0.5 rounded shrink-0">Lossless</span>
                </li>
                <li className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Link to="/view-metadata" className="font-bold text-foreground hover:text-brand transition-colors">
                      View &amp; Inspect Metadata →
                    </Link>
                    <p className="text-xs text-muted">Examine raw container markers, digital provenance manifests, and camera data.</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted bg-card-strong px-2 py-0.5 rounded shrink-0">Inspector</span>
                </li>
                <li className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Link to="/edit-metadata" className="font-bold text-foreground hover:text-brand transition-colors">
                      Edit Image Metadata →
                    </Link>
                    <p className="text-xs text-muted">Add or update author, copyright, and title tags while keeping original pixels.</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted bg-card-strong px-2 py-0.5 rounded shrink-0">Editor</span>
                </li>
                <li className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Link to="/geo-tag-photo" className="font-bold text-foreground hover:text-brand transition-colors">
                      Geo Tag Photo →
                    </Link>
                    <p className="text-xs text-muted">Pick coordinates on an interactive map and inject clean EXIF GPS tags.</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted bg-card-strong px-2 py-0.5 rounded shrink-0">Map Geotagger</span>
                </li>
                <li className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Link to="/ai-text-cleaner" className="font-bold text-foreground hover:text-brand transition-colors">
                      AI Text Cleaner →
                    </Link>
                    <p className="text-xs text-muted">Detect and sanitize zero-width spaces, invisible Unicode tags, and AI watermarks in text.</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted bg-card-strong px-2 py-0.5 rounded shrink-0">Text Sanitizer</span>
                </li>
              </ul>
            </section>

            {/* Technical Honest Disclaimers: What tools cannot do */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-risk-rose-text uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Technical Boundaries</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What Metadata Tools Cannot Do
              </h2>
              <div className="space-y-3 text-[14px] text-muted-strong leading-relaxed">
                <p>
                  We believe in technical transparency. Stripping metadata deletes the explicit data containers embedded in an image file (EXIF, IPTC, XMP, and C2PA credentials). However:
                </p>
                <ul className="space-y-2 list-disc pl-5 text-xs sm:text-[13px] text-muted">
                  <li>
                    <strong>Invisible pixel watermarks (e.g. Google SynthID):</strong> These are mathematical perturbations embedded directly into the pixel raster, not in the metadata headers. Stripping file headers does not alter pixel values.
                  </li>
                  <li>
                    <strong>Visual pixel AI detectors:</strong> Neural networks that evaluate skin smoothness, unnatural reflections, or anatomical artifacts assess pixel appearance, not file headers.
                  </li>
                  <li>
                    <strong>Platform cache:</strong> Removing metadata from a photo protects new posts. If a platform has already processed and published an image, it retains its existing record.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Facts Card */}
            <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-4">
              <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                System Overview
              </h3>
              <dl className="divide-y divide-subtle text-xs space-y-2.5">
                <div className="pt-2 flex justify-between">
                  <dt className="text-muted">Platform</dt>
                  <dd className="font-semibold text-foreground">{BRAND_CONFIG.name}</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-muted">Execution Model</dt>
                  <dd className="font-mono text-brand font-bold">100% In-Browser</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-muted">Server Uploads</dt>
                  <dd className="font-mono text-emerald-600 font-bold">0 bytes</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-muted">Domain</dt>
                  <dd className="font-mono text-foreground">{BRAND_CONFIG.domain}</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-muted">Version</dt>
                  <dd className="font-mono text-foreground">v{BRAND_CONFIG.version}</dd>
                </div>
              </dl>
            </div>

            {/* Contact & Inquiries */}
            <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                <span>Contact &amp; Inquiries</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Have questions about our lossless stripping engine, report a container edge-case, or suggest a feature?
              </p>
              <div className="pt-1">
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline"
                >
                  <span>{BRAND_CONFIG.supportEmail}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Blog CTA */}
            <div className="bg-navy rounded-panel p-6 text-white space-y-3">
              <span className="text-xs font-mono text-cyan font-bold uppercase tracking-wider">
                Educational Hub
              </span>
              <h4 className="text-base font-bold tracking-tight">
                Explore Our 20 Metadata Guides
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Read deep-dives on C2PA credentials, social media AI flags, GPS scrubbing, and lossless file structures.
              </p>
              <div className="pt-1">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan hover:underline"
                >
                  <span>Visit Knowledge Base</span>
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
