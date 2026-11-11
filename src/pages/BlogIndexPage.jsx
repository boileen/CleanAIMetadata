import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, ShieldCheck, Search, Tag } from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import articlesIndex from '../content/blog/index.json';

const CATEGORIES = [
  'All',
  'AI Credentials',
  'AI Models',
  'C2PA & Provenance',
  'GPS & Location',
  'Lossless Privacy',
  'Standards & Formats',
  'Analysis & Inspection',
];

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return articlesIndex.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      <SeoHead
        title="Privacy & Metadata Guides — AI Metadata Eraser"
        description="Comprehensive guides on removing AI metadata, C2PA content credentials, EXIF camera tags, and GPS coordinates losslessly."
        canonical="https://aimetadataeraser.com/blog"
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE &amp; GUIDES</span>
          </div>
          <h1 className="text-3xl sm:text-[42px] font-bold tracking-tight text-foreground leading-tight">
            Image Privacy, Metadata &amp; <span className="text-brand">AI Provenance</span>
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Practical, in-depth guides on stripping hidden tracking data, understanding C2PA credentials, and keeping your original pixel quality intact.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-subtle rounded-xl focus:outline-none focus:border-brand transition-colors text-foreground placeholder:text-muted/60"
              />
            </div>

            {/* Total Count */}
            <span className="text-xs font-mono text-muted self-end sm:self-center">
              Showing {filteredArticles.length} of {articlesIndex.length} guides
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-foreground text-white font-semibold shadow-sm'
                      : 'bg-card-strong text-muted hover:text-foreground hover:bg-card-strong/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-panel border border-subtle space-y-2">
            <p className="text-sm font-semibold text-foreground">No matching guides found</p>
            <p className="text-xs text-muted">Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="group flex flex-col justify-between bg-white rounded-panel border border-subtle p-6 hover:border-brand/40 hover:shadow-subtle transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-mono font-semibold text-brand bg-brand-soft px-2.5 py-0.5 rounded-md">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-[13px] text-muted leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-subtle flex items-center justify-between text-xs font-semibold text-brand">
                  <span>Read full guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Banner to Core Tool */}
        <div className="bg-navy rounded-panel p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-cyan font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Privacy</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to sanitize your photos right now?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Strip C2PA manifests, camera serial numbers, and GPS coordinates losslessly. No accounts, zero uploads.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-md transition-all shrink-0 hover:-translate-y-0.5"
          >
            <span>Open Metadata Eraser</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
