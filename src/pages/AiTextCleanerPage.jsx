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
    title: 'Strip Hidden Zero-Width Text',
    description: 'Purges U+200B, U+200C, U+200D, U+2060, and U+FEFF zero-width spaces commonly left by algorithmic text processors.',
  },
  {
    icon: Lock,
    title: 'Zero Logs, 100% In-Browser',
    description: 'Your sensitive prompts, articles, and emails are processed strictly in client RAM and are never transmitted to any external server.',
  },
  {
    icon: Zap,
    title: 'Instant Real-Time Sanitization',
    description: 'Text is parsed and cleaned in real time as you paste or type, giving you immediate feedback with zero latency.',
  },
  {
    icon: FileText,
    title: 'Punctuation & Quote Normalization',
    description: 'Converts telltale AI em-dashes (—) and typographic curly quotes into natural, standard human characters.',
  },
  {
    icon: Sliders,
    title: 'Customizable Heuristic Rules',
    description: 'Toggle individual cleaning filters on or off depending on your specific formatting or CMS publishing requirements.',
  },
  {
    icon: Layers,
    title: 'Accurate Character & Word Counts',
    description: 'Inspect exact word counts and detected invisible token numbers with side-by-side comparison counters.',
  },
  {
    icon: ShieldCheck,
    title: 'Clean LLM Signature Patterns',
    description: 'Removes the formatting artifacts that modern AI detectors scan for when screening student essays and marketing copy.',
  },
  {
    icon: HelpCircle,
    title: '1-Click Export to .TXT or Clipboard',
    description: 'Export sanitized text directly to a plain text file or copy it with one click for pasting into Google Docs or Word.',
  },
];

const TEXT_FAQS = [
  {
    question: 'How do AI generators leave invisible watermarks in text?',
    answer: 'Language models and text generation pipelines can inject invisible Unicode formatting characters (such as zero-width spaces U+200B and word joiners U+2060) or characteristic non-breaking spaces (U+00A0) between tokens. AI detectors search for these specific character codes to identify synthetic content.',
  },
  {
    question: 'Does this change the meaning of my writing?',
    answer: 'No. The cleaner removes only invisible zero-width characters and normalizes punctuation formatting (like em-dashes and curly quotes). Your vocabulary, sentence structure, and original meaning remain 100% intact.',
  },
  {
    question: 'Can this remove Google SynthID text watermarking?',
    answer: 'SynthID for text operates by subtly shifting the statistical probability of word tokens (n-grams) rather than injecting binary invisible characters. While our tool cleans all Unicode and punctuation artifacts, defeating token-level probability detectors requires slight rephrasing or manual editing.',
  },
  {
    question: 'Is my text stored or sent to any server?',
    answer: 'Never. All regex replacement and character filtering execute 100% locally in your web browser tab. If you disconnect your internet connection, the tool continues working perfectly.',
  },
  {
    question: 'Why do AI detectors look for em-dashes and smart quotes?',
    answer: 'LLMs like ChatGPT and Claude are trained on curated datasets that heavily favor typographic em-dashes (—) with specific spacing and curly quotation marks. Normalizing them to standard hyphens and straight quotes creates natural, human-formatted text.',
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
            Strip zero-width characters, invisible watermarks, non-breaking spaces, and telltale AI punctuation patterns from ChatGPT, Claude, and Gemini text directly in your browser.
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
              Features of Our AI Text Footprint Cleaner
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              Built to sanitize machine-generated text for writers, marketers, researchers, and students.
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
              AI Text Watermarks: Hidden Characters Versus Telltale Detection Marks
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              Understanding the difference between binary Unicode watermarks and stylistic pattern analysis.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-[14px] text-muted leading-relaxed">
            <p>
              When people discuss AI watermarks in text, they usually refer to two distinct mechanisms:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-card-raised border border-subtle space-y-2">
                <h3 className="font-bold text-sm text-foreground">1. Hidden Unicode Characters</h3>
                <p className="text-xs leading-relaxed">
                  Invisible zero-width characters (like <code>U+200B</code> and <code>U+FEFF</code>) that are invisible on the screen 
                  but detectable in the raw string. CleanAIMetadata carves these out 100% losslessly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card-raised border border-subtle space-y-2">
                <h3 className="font-bold text-foreground text-sm">2. Punctuation &amp; Typography Patterns</h3>
                <p className="text-xs leading-relaxed">
                  Characteristic stylistic patterns such as long em-dashes (—), smart curly quotes (“ ”), and non-breaking spaces 
                  that LLM tokenizers generate with high frequency.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card-raised border border-subtle text-muted flex items-start gap-2.5 mt-2">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                <strong>100% Private Client Execution:</strong> All string replacements, regex pattern checks, and character cleaning execute 
                strictly inside your browser memory. Your writing is never shared, logged, or saved to any external database.
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
              Common questions about zero-width spaces, token watermarks, and AI text sanitization.
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
