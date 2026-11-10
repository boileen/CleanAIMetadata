import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Zap, 
  FileText, 
  Sliders, 
  Layers, 
  HelpCircle,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';
import TextSanitizer from '../components/tools/TextSanitizer';

const TEXT_FEATURES = [
  {
    icon: Sparkles,
    title: 'Strip zero-width characters',
    description: 'Removes U+200B, U+200C, U+200D, U+2060 and U+FEFF, the invisible characters AI tools leave behind.',
  },
  {
    icon: Lock,
    title: 'Runs in your browser',
    description: 'Text stays in browser memory and is never sent to a server.',
  },
  {
    icon: Zap,
    title: 'Cleans as you type',
    description: 'Results update while you paste or type, with no delay.',
  },
  {
    icon: FileText,
    title: 'Fix punctuation and quotes',
    description: 'Turns em dashes and curly quotes into plain hyphens and straight quotes.',
  },
  {
    icon: Sliders,
    title: 'Toggle each filter',
    description: 'Turn individual rules on or off to suit your format or CMS.',
  },
  {
    icon: Layers,
    title: 'Character and word counts',
    description: 'Compare word counts and hidden characters before and after.',
  },
  {
    icon: ShieldCheck,
    title: 'Remove AI formatting tells',
    description: 'Clears the formatting artifacts detectors look for.',
  },
  {
    icon: HelpCircle,
    title: 'Export to .TXT or clipboard',
    description: 'Download a plain text file or copy the result in one click.',
  },
];

const TEXT_FAQS = [
  {
    question: 'How do AI generators leave invisible watermarks in text?',
    answer: 'Some pipelines insert invisible Unicode characters such as zero-width spaces (U+200B) or word joiners (U+2060). Detectors look for those exact codes.',
  },
  {
    question: 'Does this change the meaning of my writing?',
    answer: 'No. It removes invisible characters and normalises punctuation. Your words, sentences and meaning stay the same.',
  },
  {
    question: 'Can this remove Google SynthID text watermarking?',
    answer: 'No. SynthID shifts the probability of word choices rather than adding hidden characters. Beating it needs rephrasing, not cleaning.',
  },
  {
    question: 'Is my text stored or sent to any server?',
    answer: 'Never. Everything runs in the browser tab, and the tool still works with the network off.',
  },
  {
    question: 'Why do AI detectors look for em-dashes and smart quotes?',
    answer: 'Their training data leans on em dashes and curly quotes, so models repeat them. Converting to hyphens and straight quotes makes text look plainer.',
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

      {/* Main Container matching Unheic width: max-w-[74rem] (1184px) */}
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-12">
        
        {/* Top Header Section */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto pt-2 pb-1">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            AI Text Watermark Remover | <span className="text-brand">Hidden Characters &amp; AI Tags</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            Strip zero-width characters, non-breaking spaces, and AI punctuation from ChatGPT, Claude, and Gemini text in your browser.
          </p>
        </div>

        {/* WORKSPACE: DUAL-PANE TEXT SANITIZER */}
        <div className="space-y-4">
          <TextSanitizer />

          {/* Trust Highlights from under.png */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 px-2 text-xs text-muted font-medium justify-start pt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              100% Free
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              No installation required
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              Secure &amp; private
            </span>
          </div>
        </div>

        {/* 8-CARD FEATURES GRID MATCHING DELETEFOOTPRINTS.AI */}
        <section className="space-y-6 pt-4">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Features of the AI text cleaner
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              For writers, marketers, researchers, and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEXT_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-2.5 hover:border-subtle-hover transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center text-brand">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* EDUCATIONAL GUIDE: HIDDEN CHARACTERS VS TELLTALE DETECTION */}
        <section className="bg-white rounded-panel border border-subtle p-6 sm:p-10 shadow-subtle space-y-8 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              AI text watermarks: hidden characters vs. detection marks
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              Two different mechanisms that get confused.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-[14px] text-muted leading-relaxed">
            <p>
              Two different things get called AI watermarks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-card-raised border border-subtle space-y-2">
                <h3 className="font-bold text-sm text-foreground">1. Hidden Unicode characters</h3>
                <p className="text-xs leading-relaxed">
                  Invisible characters such as <code>U+200B</code> and <code>U+FEFF</code>. You
                  cannot see them, but they sit in the raw string. This tool removes them without
                  changing your words.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card-raised border border-subtle space-y-2">
                <h3 className="font-bold text-foreground text-sm">2. Punctuation and typography</h3>
                <p className="text-xs leading-relaxed">
                  Em dashes, curly quotes, and non-breaking spaces that language models produce
                  more often than people do.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card-raised border border-subtle text-muted flex items-start gap-2.5 mt-2">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                <strong>Nothing leaves your browser:</strong> every replacement runs in local
                memory. Your writing is never logged or saved.
              </span>
            </div>
          </div>
        </section>

        {/* FAQs SECTION (5 Questions from DeleteFootprints) */}
        <section className="space-y-6 pt-2 pb-6">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              Zero-width spaces, token watermarks, and text cleaning.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {TEXT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-panel border border-subtle overflow-hidden shadow-subtle transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-4 sm:py-5 px-6 flex items-center justify-between gap-4 text-left hover:bg-card-raised/60 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {faq.question}
                    </span>
                    <div className={`w-7 h-7 rounded-lg bg-card-strong border border-subtle flex items-center justify-center shrink-0 text-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-[14px] text-muted leading-relaxed border-t border-subtle/50 bg-card-raised/30 animate-fadeIn">
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
