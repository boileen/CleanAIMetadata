import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema, getFaqSchema } from '../config/seoConfig';
import TextSanitizer from '../components/tools/TextSanitizer';

const FAQS = [
  {
    question: 'What gets removed?',
    answer:
      'Zero-width spaces and joiners, non-breaking and exotic spaces, soft hyphens, byte-order marks, bidi controls, tag characters and other invisible format characters. It also finds generator metadata, AI referrer parameters, chat-export markers and decoded hidden payloads. Typography repair is optional.',
  },
  {
    question: 'Does it change my words?',
    answer:
      'No. There is no thesaurus and no language model. Words, spelling and sentence structure stay identical. The Patterns tab only counts habits such as uniform sentence length, repeated openers and stock phrases, and quotes your own sentences so you can decide what to edit.',
  },
  {
    question: 'Does this make text undetectable or remove watermarks?',
    answer: (
      <>
        No. Detectors score token choice and sentence variation, not invisible characters, and
        statistical watermarks such as SynthID are embedded in the tokens themselves. Character
        cleaning cannot remove either.{' '}
        <Link to="/blog/ai-text-cleaner-what-it-can-and-cannot-remove" className="text-brand font-semibold hover:underline">
          What a cleaner can and cannot remove
        </Link>
        .
      </>
    ),
  },
  {
    question: 'Where do invisible characters come from?',
    answer:
      'Mostly copy-paste. PDF extraction inserts soft hyphens and odd spaces, content systems use zero-width spaces as line-break hacks, Word and Google Docs add curly quotes and non-breaking spaces, and chat interfaces leave export markers behind. Language models output tokens, not invisible characters.',
  },
  {
    question: 'Is my text uploaded, and how much can I paste?',
    answer:
      'Nothing leaves this tab. The cleaner is plain JavaScript running locally, with no request, account, queue or storage. The limit is 200,000 characters; larger pastes are flagged rather than silently truncated.',
  },
];

function TrustBadges() {
  const items = ['100% Free', 'No installation required', 'Secure & private'];

  return (
    <div className="flex flex-wrap items-center gap-5 sm:gap-7 px-2 text-[11px] text-muted font-medium justify-start">
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
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={[schema, faqSchema]}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-8">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            Clean Invisible <span className="text-brand">AI Text Markers</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            Remove invisible characters and AI tags, then review writing patterns. Local only, no
            wording changes.
          </p>
        </div>

        <div className="space-y-4">
          <TextSanitizer />
          <TrustBadges />
        </div>

        <section className="space-y-4 pt-4 pb-6">
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
