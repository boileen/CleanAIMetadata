import React from 'react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';

export default function InstagramGuidePage() {
  const seo = SEO_CONFIG.instagramGuide;
  const schema = getWebApplicationSchema(seo);

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={schema}
      />
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
          {seo.eyebrow}
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-foreground">
          {seo.h1}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          {seo.description}
        </p>
      </div>
    </div>
  );
}
