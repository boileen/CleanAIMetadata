import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../../config/brandConfig';
import LogoIcon from '../brand/LogoIcon';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-navy border-t border-navy-border mt-24 pt-16 pb-14 text-white/70">
      {/* Real Unheic width: 74rem (1184px) */}
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6">
        
        {/* Top 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-14 border-b border-white/15">
          
          {/* Column 1: Convert & Clean */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] font-mono font-bold uppercase tracking-wider text-white">
              Convert & Clean
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/" className="text-white/75 hover:text-white transition-colors">
                  Remove Metadata
                </Link>
              </li>
              <li>
                <Link to="/edit-metadata" className="text-white/75 hover:text-white transition-colors">
                  Edit Image Metadata
                </Link>
              </li>
              <li>
                <Link to="/geo-tag-photo" className="text-white/75 hover:text-white transition-colors">
                  Geo Tag Photo
                </Link>
              </li>
              <li>
                <Link to="/ai-text-cleaner" className="text-white/75 hover:text-white transition-colors">
                  AI Text Cleaner
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Inspect */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] font-mono font-bold uppercase tracking-wider text-white">
              Inspect
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/view-metadata" className="text-white/75 hover:text-white transition-colors">
                  Metadata Viewer
                </Link>
              </li>
              <li>
                <Link to="/view-metadata" className="text-white/75 hover:text-white transition-colors">
                  C2PA Provenance Inspector
                </Link>
              </li>
              <li>
                <Link to="/view-metadata" className="text-white/75 hover:text-white transition-colors">
                  EXIF & GPS Triage
                </Link>
              </li>
              <li>
                <Link to="/view-metadata" className="text-white/75 hover:text-white transition-colors">
                  Generative Model Hashes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Understand */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] font-mono font-bold uppercase tracking-wider text-white">
              Understand
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/instagram-ai-label-guide" className="text-white/75 hover:text-white transition-colors">
                  Instagram "AI Info" Guide
                </Link>
              </li>
              <li>
                <a href="#matrix-section" className="text-white/75 hover:text-white transition-colors">
                  What is a C2PA Manifest?
                </a>
              </li>
              <li>
                <a href="#faqs-section" className="text-white/75 hover:text-white transition-colors">
                  Why Metadata Matters
                </a>
              </li>
              <li>
                <a href="#verification-section" className="text-white/75 hover:text-white transition-colors">
                  What Survives the Browser?
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Project & Privacy */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] font-mono font-bold uppercase tracking-wider text-white">
              Project & Privacy
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <span className="inline-flex items-center gap-1.5 text-cyan font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
                  100% In-Browser Privacy
                </span>
              </li>
              <li>
                <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-white/75 hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" className="text-white/75 hover:text-white transition-colors">
                  Sitemap
                </a>
              </li>
              <li>
                <span className="text-white/50">Zero Server Uploads</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Privacy Statement & Brand Host */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/70">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="w-5 h-5 shrink-0" isDark={true} />
            <span>
              Part of the {BRAND_CONFIG.name} suite of free privacy utilities, all running in your browser.
            </span>
          </div>

          <div className="flex items-center gap-5 text-[12px] font-mono">
            <span>© {currentYear} {BRAND_CONFIG.name}.</span>
            <span>Canonical host: {BRAND_CONFIG.domain}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
