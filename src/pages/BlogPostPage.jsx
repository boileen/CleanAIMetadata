import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import articlesIndex from '../content/blog/index.json';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    import(`../content/blog/${slug}.json`)
      .then((mod) => {
        if (!cancelled) {
          setArticle(mod.default || mod);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return <Navigate to="/blog" replace />;
  }

  if (loading || !article) {
    return (
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Generate Table of Contents from H2 headings
  const toc = (article.blocks || [])
    .filter((b) => b.type === 'h2')
    .map((b) => {
      const id = b.text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return { id, text: b.text };
    });

  // Find related articles in the same category
  const relatedArticles = articlesIndex
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: '2026-11-10T00:00:00+00:00',
    dateModified: '2026-11-10T00:00:00+00:00',
    author: {
      '@type': 'Organization',
      name: 'AI Metadata Eraser',
      url: 'https://aimetadataeraser.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Metadata Eraser',
      url: 'https://aimetadataeraser.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aimetadataeraser.com/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://aimetadataeraser.com/blog/${slug}`,
    },
  };

  return (
    <div className="w-full">
      <SeoHead
        title={`${article.title} | AI Metadata Eraser`}
        description={article.excerpt}
        canonical={`https://aimetadataeraser.com/blog/${slug}`}
        schemaJson={articleSchema}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-[280px] sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-brand bg-brand-soft px-3 py-1 rounded-md">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted">
              <Calendar className="w-3.5 h-3.5" />
              {article.date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-foreground leading-[1.15]">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed pt-1">
            {article.excerpt}
          </p>
        </header>

        {/* 2-Column Layout: Article Body + Sticky TOC Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Content (8 cols) */}
          <main className="lg:col-span-8 bg-white rounded-panel border border-subtle p-6 sm:p-10 shadow-subtle space-y-8">
            {/* Embedded In-Article Tool Hero Box */}
            <div className="rounded-xl border border-brand/20 bg-brand-soft/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free In-Browser Tool</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  {article.toolLabel}
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  {article.toolDesc}
                </p>
              </div>
              <Link
                to={article.targetTool}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-sm transition-all shrink-0"
              >
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Document Body Blocks */}
            <div className="space-y-6 text-foreground leading-relaxed text-[15px] sm:text-base">
              {(article.blocks || []).map((block, idx) => {
                if (block.type === 'h2') {
                  const id = block.text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                  return (
                    <h2
                      key={idx}
                      id={id}
                      className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-6 border-t border-subtle scroll-mt-24 first:border-0 first:pt-0"
                    >
                      {block.text}
                    </h2>
                  );
                }

                if (block.type === 'h3') {
                  return (
                    <h3
                      key={idx}
                      className="text-base sm:text-lg font-bold tracking-tight text-foreground pt-3"
                    >
                      {block.text}
                    </h3>
                  );
                }

                if (block.type === 'li') {
                  return (
                    <div key={idx} className="flex items-start gap-3 pl-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-2"></span>
                      <p className="text-muted-strong leading-relaxed">
                        {block.text}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="text-muted-strong leading-relaxed">
                    {block.text}
                  </p>
                );
              })}
            </div>

            {/* End-of-article Bottom CTA */}
            <div className="mt-10 pt-8 border-t border-subtle bg-navy -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-10 rounded-b-panel text-white space-y-4">
              <span className="text-xs font-mono text-cyan font-bold uppercase tracking-wider">
                100% Client-Side Privacy
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Try {article.toolLabel}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
                Everything runs locally in your browser. We never transmit your images to any remote servers, cloud workers, or third-party APIs.
              </p>
              <div className="pt-2">
                <Link
                  to={article.targetTool}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </main>

          {/* Sticky Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-brand" />
                  <span>On this page</span>
                </div>
                <nav className="space-y-2">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-xs text-muted hover:text-brand hover:underline transition-colors line-clamp-1 leading-snug"
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-4">
                <h4 className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  Related Guides
                </h4>
                <div className="space-y-3">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.slug}
                      to={`/blog/${rel.slug}`}
                      className="block group space-y-1"
                    >
                      <span className="text-xs font-bold text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        {rel.readTime}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog Hub */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all 20 guides</span>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
