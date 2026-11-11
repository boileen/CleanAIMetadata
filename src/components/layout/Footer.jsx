import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../../config/brandConfig';
import LogoIcon from '../brand/LogoIcon';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-navy border-t border-navy-border mt-20 pt-12 pb-10 text-white/70">
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6">
        {/* Top 3-Column Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-10 border-b border-white/10">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide">
              Tools
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors">
                  Remove Metadata
                </Link>
              </li>
              <li>
                <Link to="/view-metadata" className="text-white/70 hover:text-white transition-colors">
                  View Metadata
                </Link>
              </li>
              <li>
                <Link to="/edit-metadata" className="text-white/70 hover:text-white transition-colors">
                  Edit Metadata
                </Link>
              </li>
              <li>
                <Link to="/geo-tag-photo" className="text-white/70 hover:text-white transition-colors">
                  Geo Tag Photo
                </Link>
              </li>
              <li>
                <Link to="/ai-text-cleaner" className="text-white/70 hover:text-white transition-colors">
                  AI Text Cleaner
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide">
              Guides &amp; Blog
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="text-cyan hover:text-white font-medium transition-colors flex items-center gap-1.5">
                  <span>Explore All 20 Guides</span>
                  <span className="text-[10px] font-mono bg-cyan/20 px-1.5 py-0.5 rounded text-cyan">NEW</span>
                </Link>
              </li>
              <li>
                <Link to="/blog/why-instagram-or-facebook-may-show-an-ai-info-label" className="text-white/70 hover:text-white transition-colors">
                  Instagram AI Label Guide
                </Link>
              </li>
              <li>
                <Link to="/blog/how-to-remove-gps-location-data-from-photos-before-sharing" className="text-white/70 hover:text-white transition-colors">
                  Scrub Photo GPS Location
                </Link>
              </li>
              <li>
                <Link to="/blog/c2pa-content-credentials-explained-what-image-owners-should-know" className="text-white/70 hover:text-white transition-colors">
                  C2PA Content Credentials
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide">
              Privacy
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="inline-flex items-center gap-1.5 text-cyan font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
                  100% In-Browser Processing
                </span>
              </li>
              <li>
                <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-white/70 hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" className="text-white/70 hover:text-white transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-4 h-4 shrink-0" isDark={true} />
            <span>{BRAND_CONFIG.name} — client-side privacy tools</span>
          </div>

          <div className="flex items-center gap-4">
            <span>© {currentYear}</span>
            <span>{BRAND_CONFIG.domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
