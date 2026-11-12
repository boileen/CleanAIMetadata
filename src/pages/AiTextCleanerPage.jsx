import React, { useState } from 'react';
import {
  ChevronDown,
  Eye,
  ScanText,
  Braces,
  Sparkles,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema, getFaqSchema } from '../config/seoConfig';
import TextSanitizer from '../components/tools/TextSanitizer';

const STEPS = [
  { number: '1', title: 'Paste your text' },
  { number: '2', title: 'Scan the code points' },
  { number: '3', title: 'Pick a cleaning profile' },
  { number: '4', title: 'Copy or download' },
];

const FEATURES = [
  {
    index: '01',
    icon: ScanText,
    title: 'Invisible Unicode sweep',
    detail:
      'Zero-width spaces and joiners, BOMs, soft hyphens from PDFs, bidi overrides, tag characters, and exotic spaces are found by code point, not by guesswork.',
  },
  {
    index: '02',
    icon: Sparkles,
    title: 'Typography repair',
    detail:
      'Curly quotes, em and en dashes, ellipses, guillemets, and fullwidth punctuation are normalised — only when the profile you pick asks for it.',
  },
  {
    index: '03',
    icon: Eye,
    title: 'Reveal mode',
    detail:
      'Flip the input pane into a marked-up view and see every hidden character as a labelled chip. No more invisible gaps you have to trust.',
  },
  {
    index: '04',
    icon: Braces,
    title: 'Code-safe by default',
    detail:
      'Fenced blocks, inline code, URLs, and email addresses are held byte-identical, so a pasted README survives the trip. Emoji sequences keep their joiners.',
  },
];

const FAQS = [
  {
    question: 'What exactly gets removed?',
    answer:
      'Zero-width spaces, non-breaking spaces, word joiners, byte-order marks, soft hyphens, bidi control characters, and other invisible format characters. With the Standard or Aggressive profile it also repairs curly quotes, em dashes, ellipses, and fullwidth punctuation.',
  },
  {
    question: 'Where do invisible characters come from?',
    answer:
      'Mostly from copy-paste. PDF extraction inserts soft hyphens and odd spaces, content management systems use zero-width spaces as line-break hacks, Word and Google Docs add curly quotes and non-breaking spaces, and some “AI humanizer” tools deliberately inject zero-width characters. Language models themselves output tokens, not invisible characters.',
  },
  {
    question: 'Does this make my text undetectable by AI detectors?',
    answer:
      'No. Detectors such as GPTZero score token choice, perplexity, and sentence variation. They do not read zero-width spaces, so removing those characters will not change a detector score. This tool cleans paste artifacts and typography, not statistical fingerprints.',
  },
  {
    question: 'Can it remove Google SynthID or other watermarks?',
    answer:
      'No. Statistical watermarks like SynthID-Text are embedded in the probability of which tokens the model chose. They cannot be removed by character-level cleaning; doing so would require rewriting the text, which this tool deliberately does not do.',
  },
  {
    question: 'Does it change my words or phrasing?',
    answer:
      'No. There is no thesaurus and no language model. Words, spelling, and sentence structure stay identical; only invisible characters, whitespace, and punctuation are touched, and only inside the rules you enable.',
  },
  {
    question: 'Will it break code, URLs, or emoji?',
    answer:
      'Not by default. Fenced code blocks, inline code, links, and email addresses are protected, and emoji keep their zero-width joiners, variation selectors, and tag characters. Both protections can be switched off in the rules panel if you want a full sweep.',
  },
  {
    question: 'Is my text uploaded anywhere?',
    answer:
      'No. The sanitizer is plain JavaScript running in this tab. There is no request, no account, no queue, and no storage — closing the page discards everything.',
  },
  {
    question: 'How much text can I paste?',
    answer:
      'Up to 200,000 characters, which is roughly a 300-page book chapter. Larger pastes are flagged instead of silently truncated so you always know what was processed.',
  },
];

function TrustBadges() {
  const items = ['100% Free', 'No installation required', 'Secure & private'];

  return (
    <div className="flex flex-wrap items-center gap-5 sm:gap-7 px-2 text-[11px] text-muted font-medium justify-start -mt-2">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-brand flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AiTextCleanerPage() {
  const seo = SEO_CONFIG.aiTextCleaner;
  const schema = getWebApplicationSchema(seo);
  const faqSchema = getFaqSchema(FAQS);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={[schema, faqSchema]}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2 pb-1">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            Clean Invisible <span className="text-brand">AI Text Markers</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            Strip zero-width characters, soft hyphens, odd spaces, and AI-style punctuation in your
            browser. No wording changes, no uploads.
          </p>
        </div>

        {/* Tool */}
        <div className="space-y-4">
          <TextSanitizer />
          <TrustBadges />
        </div>

        {/* How it works */}
        <section className="pt-2">
          <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 divide-y md:divide-y-0 md:divide-x divide-subtle">
              {STEPS.map((step) => (
                <div key={step.number} className="flex items-center gap-3 pt-3 md:pt-0 md:px-4 first:pt-0 first:px-0">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-brand leading-none">
                    {step.number}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What it handles */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              What the cleaner handles
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Deterministic · no model
            </span>
          </div>

          <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[10px] font-bold text-muted">{feature.index}</span>
                        <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{feature.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4 pt-2 pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>

          <div className="bg-white rounded-panel border border-subtle divide-y divide-subtle shadow-subtle overflow-hidden">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-4 px-6 flex items-center justify-between gap-4 text-left hover:bg-card-raised/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-foreground">{faq.question}</span>
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
