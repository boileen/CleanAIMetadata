import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';
import TextSanitizer from '../components/tools/TextSanitizer';

const TEXT_FEATURES = [
  {
    title: 'Zero-width Unicode removal',
    description: 'Strips U+200B, U+200C, U+200D, U+2060, and byte-order marks.',
  },
  {
    title: 'Punctuation normalisation',
    description: 'Converts curly quotes, em dashes, and non-breaking spaces to plain equivalents.',
  },
  {
    title: 'Live character inspection',
    description: 'Highlights hidden codes and calculates savings in real time.',
  },
  {
    title: 'Per-rule toggles',
    description: 'Enable or disable individual cleanup steps to fit your workflow.',
  },
];

const TEXT_FAQS = [
  {
    question: 'How do AI generators leave invisible marks in text?',
    answer: 'Some pipelines insert zero-width spaces (U+200B) or word joiners (U+2060). Detectors match those character codes.',
  },
  {
    question: 'Does this change the words or phrasing?',
    answer: 'No. Only invisible characters and punctuation are normalised. Words, spelling, and sentence structure stay identical.',
  },
  {
    question: 'Can this remove Google SynthID text watermarks?',
    answer: 'No. SynthID shifts token probability rather than inserting hidden characters, which requires rephrasing.',
  },
];

export default function AiTextCleanerPage() {
  const seo = SEO_CONFIG.aiTextCleaner;
  const schema = getWebApplicationSchema(seo);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={schema}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto pt-2 pb-1">
          <h1 className="font-display text-4xl sm:text-[50px] text-foreground leading-[1.08] tracking-[-0.01em]">
            Clean invisible <span className="text-brand italic">AI text markers</span>
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Strip zero-width characters, non-breaking spaces, and AI punctuation patterns in your browser.
          </p>
        </div>

        {/* Tool */}
        <div className="space-y-4">
          <TextSanitizer />
        </div>

        {/* Features */}
        <section className="space-y-4 pt-2">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            What the cleaner handles
          </h2>

          <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEXT_FEATURES.map((feat) => (
                <div key={feat.title} className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4 pt-2 pb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            Frequently asked questions
          </h2>

          <div className="bg-white rounded-panel border border-subtle divide-y divide-subtle shadow-subtle overflow-hidden">
            {TEXT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-4 px-6 flex items-center justify-between gap-4 text-left hover:bg-card-raised/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-4 pt-0 text-sm text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
