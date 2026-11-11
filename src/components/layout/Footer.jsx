import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Instagram, Mail, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brandConfig';
import LogoIcon from '../brand/LogoIcon';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-navy border-t border-navy-border mt-20 pt-14 pb-10 text-white/70">
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 space-y-12">
        {/* Main 4-Column Directory (deletefootprints.ai-inspired structure) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & About (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <LogoIcon className="w-7 h-7 shrink-0" isDark={true} />
              <span className="font-bold text-lg text-white tracking-tight">
                {BRAND_CONFIG.name}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed pr-4">
              Free, 100% client-side privacy suite to losslessly inspect, sanitize, and strip AI metadata (C2PA/JUMBF), camera EXIF, and GPS location directly inside your browser. No files are ever sent to remote servers.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-2 text-cyan font-mono text-xs font-semibold bg-cyan/10 border border-cyan/20 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
                <span>Zero Server Uploads · 100% Private</span>
              </span>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-white/50 mb-2">
                Connect
              </h5>
              <div className="flex items-center gap-3">
                <a
                  href={BRAND_CONFIG.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={BRAND_CONFIG.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={BRAND_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="Contact Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Tools (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Privacy Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center justify-between group">
                  <span>Remove Metadata</span>
                  <span className="text-[10px] font-mono text-cyan/70 opacity-0 group-hover:opacity-100 transition-opacity">Lossless</span>
                </Link>
              </li>
              <li>
                <Link to="/view-metadata" className="text-white/70 hover:text-white transition-colors flex items-center justify-between group">
                  <span>View &amp; Inspect Metadata</span>
                  <span className="text-[10px] font-mono text-cyan/70 opacity-0 group-hover:opacity-100 transition-opacity">Raw hex</span>
                </Link>
              </li>
              <li>
                <Link to="/edit-metadata" className="text-white/70 hover:text-white transition-colors">
                  Edit Image Metadata
                </Link>
              </li>
              <li>
                <Link to="/geo-tag-photo" className="text-white/70 hover:text-white transition-colors">
                  Geo Tag Photo Online
                </Link>
              </li>
              <li>
                <Link to="/ai-text-cleaner" className="text-white/70 hover:text-white transition-colors">
                  AI Text Cleaner
                </Link>
              </li>
              <li>
                <Link to="/instagram-ai-label-guide" className="text-white/70 hover:text-white transition-colors">
                  Instagram AI Label Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Guides & Blog (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Guides &amp; Blog
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <Link
                  to="/blog"
                  className="text-cyan hover:text-white font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <span>All 20 Knowledge Guides</span>
                  <span className="text-[10px] font-mono bg-cyan/20 px-1.5 py-0.5 rounded text-cyan font-bold">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/why-instagram-or-facebook-may-show-an-ai-info-label"
                  className="text-white/70 hover:text-white transition-colors line-clamp-1"
                >
                  Instagram AI Label Removal
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/how-to-remove-gps-location-data-from-photos-before-sharing"
                  className="text-white/70 hover:text-white transition-colors line-clamp-1"
                >
                  Remove GPS Location Data
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/c2pa-content-credentials-explained-what-image-owners-should-know"
                  className="text-white/70 hover:text-white transition-colors line-clamp-1"
                >
                  C2PA Content Credentials Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/chatgpt-image-metadata-what-can-be-embedded-and-how-to-inspect-it"
                  className="text-white/70 hover:text-white transition-colors line-clamp-1"
                >
                  ChatGPT / DALL-E Metadata
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/does-taking-a-screenshot-remove-image-metadata"
                  className="text-white/70 hover:text-white transition-colors line-clamp-1"
                >
                  Screenshot vs. Metadata Stripping
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links & Support (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Contact &amp; Support
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Sitemap XML</span>
                  <ArrowUpRight className="w-3 h-3 text-white/40" />
                </a>
              </li>
              <li>
                <span className="text-white/50 text-[11px] block pt-2 leading-relaxed">
                  Execution: 100% In-Browser WebAssembly / JS Thread.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Domain, Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-4 h-4 shrink-0" isDark={true} />
            <span>
              © {currentYear} {BRAND_CONFIG.name}. Built for creators &amp; privacy enthusiasts.
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-white/70">{BRAND_CONFIG.domain}</span>
            <span className="text-white/30">·</span>
            <span className="text-cyan">v{BRAND_CONFIG.version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
