import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brandConfig';

const NAV_LINKS = [
  { name: 'Remove Metadata', path: '/' },
  { name: 'View Metadata', path: '/view-metadata' },
  { name: 'Edit Metadata', path: '/edit-metadata' },
  { name: 'Geo Tag Photo', path: '/geo-tag-photo' },
  { name: 'AI Text Cleaner', path: '/ai-text-cleaner' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-subtle">
      {/* 74rem max-width matching Unheic container */}
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-6">
        
        {/* Brand Left: Logo Icon with coral micro-dot + Name + Subtitle */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-[19px] tracking-tight text-foreground leading-none">
              {BRAND_CONFIG.logo.primary}{' '}
              <span className="text-brand font-bold">{BRAND_CONFIG.logo.accent}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-[0.14em] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"></span>
              {BRAND_CONFIG.logo.tagline}
            </span>
          </div>
        </Link>

        {/* Center/Right Nav: Strictly Single-Line Horizontal Navlinks */}
        <nav className="hidden lg:flex items-center gap-2 shrink-0">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive
                    ? 'bg-card-strong text-foreground font-bold shadow-subtle'
                    : 'text-muted-strong hover:text-foreground hover:bg-card-strong/60 font-medium'
                }`}
              >
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile Menu Button only */}
        <div className="lg:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-strong transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-subtle bg-white px-5 py-4 space-y-2 shadow-lg animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-card-strong text-foreground font-bold'
                      : 'text-muted-strong hover:bg-card-strong'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
