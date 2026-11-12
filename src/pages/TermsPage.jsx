import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScrollText,
  Wrench,
  CheckCircle2,
  ShieldAlert,
  Copyright,
  AlertTriangle,
  Scale,
  ExternalLink,
  RefreshCw,
  Mail,
  ArrowRight,
  FileText,
  Gavel,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { BRAND_CONFIG } from '../config/brandConfig';

const LAST_UPDATED = 'November 12, 2026';
const EFFECTIVE_DATE = 'November 1, 2026';

export default function TermsPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Terms of Service | ${BRAND_CONFIG.name}`,
    description:
      'The terms that govern your use of our free, 100% client-side metadata inspection and sanitization tools.',
    url: `${BRAND_CONFIG.canonicalBase}/terms`,
  };

  return (
    <div className="w-full">
      <SeoHead
        title={`Terms of Service | ${BRAND_CONFIG.name}`}
        description="Read the terms governing use of our free, 100% client-side metadata tools: permitted use, limitations, warranties, and liability."
        canonical={`${BRAND_CONFIG.canonicalBase}/terms`}
        schemaJson={pageSchema}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-mono font-bold">
            <ScrollText className="w-3.5 h-3.5" />
            <span>PLAIN-LANGUAGE TERMS</span>
          </div>
          <h1 className="text-3xl sm:text-[42px] font-bold tracking-tight text-foreground leading-tight">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            The rules for using this site. Short version: use the tools lawfully, and understand
            what they can and cannot do.
          </p>
          <p className="text-xs text-muted font-mono">
            Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE} · Version{' '}
            {BRAND_CONFIG.version}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Acceptance */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-3 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  By accessing or using{' '}
                  <strong className="text-foreground">{BRAND_CONFIG.name}</strong> at{' '}
                  <span className="font-mono text-sm">{BRAND_CONFIG.domain}</span>, you agree to
                  these Terms of Service. If you do not agree, please stop using the site.
                </p>
                <p>
                  These terms apply to every page, tool, and piece of content on the site, including
                  the metadata remover, metadata inspector, metadata editor, geo-tagging tool, and AI
                  text cleaner.
                </p>
              </div>
            </section>

            {/* 2. Description of Service */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>What This Is</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                2. Description of Service
              </h2>
              <div className="space-y-3 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  {BRAND_CONFIG.name} provides free, browser-based utilities for inspecting, editing,
                  and removing metadata from image files, and for cleaning characters and punctuation
                  from text. All processing runs locally in your browser.
                </p>
                <ul className="space-y-2 text-sm list-disc pl-5">
                  <li>
                    <strong className="text-foreground">Free to use:</strong> no payment, account, or
                    registration is required.
                  </li>
                  <li>
                    <strong className="text-foreground">Client-side:</strong> files and text are
                    processed in memory and never transmitted to us.
                  </li>
                  <li>
                    <strong className="text-foreground">No storage:</strong> we keep no copy of your
                    inputs or outputs.
                  </li>
                  <li>
                    <strong className="text-foreground">Not a professional service:</strong> the
                    tools are provided as general-purpose utilities, not as legal, forensic, or
                    compliance advice.
                  </li>
                </ul>
                <p className="text-xs text-muted">
                  We may add, modify, or discontinue any tool at any time without notice.
                </p>
              </div>
            </section>

            {/* 3. Permitted Use */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Allowed</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                3. Permitted Use
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                You may use the site for any lawful personal or commercial purpose, including:
              </p>
              <ul className="space-y-2 text-sm text-muted-strong leading-relaxed list-disc pl-5">
                <li>Removing GPS, device, and camera data from your own photographs before sharing.</li>
                <li>Inspecting metadata on files you own or have permission to examine.</li>
                <li>Adding your own copyright, creator, or location tags to your own images.</li>
                <li>Cleaning invisible Unicode characters and stray punctuation from text you own.</li>
                <li>Verifying the results of a metadata or text cleanup on your own files.</li>
              </ul>
            </section>

            {/* 4. Prohibited Use */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-risk-rose-text uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Not Allowed</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                4. Prohibited Use
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">You agree not to:</p>
              <ul className="space-y-2 text-sm text-muted-strong leading-relaxed list-disc pl-5">
                <li>
                  Use the tools to process content you do not own or have no permission to modify.
                </li>
                <li>
                  Remove or alter metadata, signatures, or content credentials in order to deceive,
                  misrepresent authorship, or facilitate fraud.
                </li>
                <li>
                  Use the site to violate any applicable law, including copyright, privacy, consumer
                  protection, or data protection law.
                </li>
                <li>
                  Attempt to disrupt the site, probe its infrastructure, or bypass technical
                  protections.
                </li>
                <li>
                  Scrape, mirror, or resell the site or its content without written permission.
                </li>
                <li>
                  Present the tools as a guarantee that a file is untraceable, authentic, or free of
                  AI involvement.
                </li>
              </ul>
            </section>

            {/* 5. Intellectual Property */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Copyright className="w-4 h-4" />
                <span>Ownership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                5. Intellectual Property
              </h2>
              <div className="space-y-3 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  <strong className="text-foreground">Your content stays yours.</strong> You retain
                  all rights to the images and text you load into the tools. We claim no licence or
                  ownership over your files, and we never receive them.
                </p>
                <p>
                  The site itself — its code, design, brand assets, and written content — is owned by{' '}
                  {BRAND_CONFIG.name} and protected by applicable intellectual property law. You may
                  not copy or redistribute it except as permitted by law or with written permission.
                </p>
              </div>
            </section>

            {/* 6. Disclaimer of Warranties */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-risk-rose-text uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Read This Carefully</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                6. Disclaimer of Warranties
              </h2>
              <div className="space-y-3 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  The site and all tools are provided{' '}
                  <strong className="text-foreground">“as is” and “as available”</strong>, without
                  warranties of any kind, express or implied, including fitness for a particular
                  purpose, merchantability, and non-infringement.
                </p>
                <p>In particular, we do not warrant that:</p>
                <ul className="space-y-2 text-sm text-muted-strong leading-relaxed list-disc pl-5">
                  <li>
                    Every metadata field, container, or signing structure will be detected or
                    removed.
                  </li>
                  <li>
                    Cleaning a file will prevent platform labels, pixel-level watermarks, visual AI
                    detectors, or cached copies from identifying it.
                  </li>
                  <li>
                    The text cleaner will remove every invisible character or satisfy any particular
                    detector’s criteria.
                  </li>
                  <li>The service will be uninterrupted, error-free, or compatible with every file.</li>
                </ul>
                <p className="text-xs text-muted">
                  Always verify important output independently before relying on it.
                </p>
              </div>
            </section>

            {/* 7. Limitation of Liability */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Gavel className="w-4 h-4" />
                <span>Liability Cap</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                7. Limitation of Liability
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                To the fullest extent permitted by law, {BRAND_CONFIG.name} and its operators shall
                not be liable for any indirect, incidental, special, consequential, or punitive
                damages, or for any loss of data, profits, goodwill, or business opportunity, arising
                from your use of or inability to use the site. This includes, without limitation,
                consequences of failing to remove metadata, corrupting a file, or relying on cleaned
                output. Because the service is provided free of charge, our total aggregate liability
                for any claim shall not exceed the amount you paid to use the site, which is zero.
              </p>
            </section>

            {/* 8. Third-Party Links */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <ExternalLink className="w-4 h-4" />
                <span>External Services</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                8. Third-Party Links &amp; Services
              </h2>
              <div className="space-y-3 text-[15px] text-muted-strong leading-relaxed">
                <p>
                  The site may link to third-party resources, and the Geo Tag page may load map tiles
                  or send a place search to OpenStreetMap services at your request. Those services are
                  operated by third parties under their own terms and privacy policies.
                </p>
                <p>
                  We do not control and are not responsible for third-party content, availability, or
                  data practices. Your use of a third-party service is at your own risk.
                </p>
              </div>
            </section>

            {/* 9. Governing Law */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Jurisdiction</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                9. Governing Law
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                These terms are governed by the laws applicable at the operator’s principal place of
                business, without regard to conflict-of-law rules. Any dispute arising from these
                terms or your use of the site shall be brought in the competent courts of that
                jurisdiction, unless mandatory local consumer law provides otherwise. Nothing here
                limits rights you cannot lawfully waive.
              </p>
            </section>

            {/* 10. Changes */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                <RefreshCw className="w-4 h-4" />
                <span>Updates</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                10. Changes to These Terms
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                We may revise these terms from time to time. The revised version takes effect when
                published on this page, and the{' '}
                <strong className="text-foreground">Last updated</strong> date will change. Your
                continued use of the site after publication means you accept the revised terms.
              </p>
            </section>

            {/* 11. Contact */}
            <section className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                11. Contact
              </h2>
              <p className="text-[15px] text-muted-strong leading-relaxed">
                Questions about these terms can be sent to:
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
                Terms at a Glance
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
                  <dt className="text-muted">Cost</dt>
                  <dd className="font-mono text-emerald-600 font-bold">Free</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Account required</dt>
                  <dd className="font-mono text-emerald-600 font-bold">No</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-muted">Your content</dt>
                  <dd className="font-mono text-brand font-bold">Yours</dd>
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
                    to="/privacy"
                    className="inline-flex items-center gap-1.5 text-foreground font-semibold hover:text-brand transition-colors"
                  >
                    <span>Privacy Policy</span>
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

            {/* Honest note */}
            <div className="bg-navy rounded-panel p-6 text-white space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan" />
                <span className="text-xs font-mono text-cyan font-bold uppercase tracking-wider">
                  Set Expectations
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                These tools remove explicit metadata containers and stray invisible characters. They
                cannot remove pixel-level watermarks, change how a platform labels a file, or
                guarantee that content is undetectable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
