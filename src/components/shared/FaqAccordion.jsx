import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Will this remove all metadata, including AI-specific tags?',
    answer: 'Yes. The remover cleans EXIF, IPTC, and XMP blocks as well as common AI-identifying blocks such as C2PA/JUMBF and PNG text chunks when present. This targets metadata-only AI signatures while leaving pixels 100% untouched.',
  },
  {
    question: 'Can you remove invisible or visual AI watermarks?',
    answer: 'No. We clean metadata only. Some proprietary models (such as Google Gemini/Imagen with SynthID) embed algorithmic marks inside pixel patterns that survive header stripping. Those require pixel-level editing or manual retouching.',
  },
  {
    question: 'Do you store my images? How long are files kept?',
    answer: 'Zero storage. All processing occurs 100% in your local browser tab using native WebAssembly and memory ArrayBuffers. User files are never uploaded to our servers, never stored, and never used for AI training.',
  },
  {
    question: 'What formats and limits are supported?',
    answer: 'Supported formats include JPG/JPEG, PNG, WebP, TIFF, and HEIC. The maximum batch size is 5 images up to 100 MB cumulative size per session.',
  },
  {
    question: 'Will removing the metadata remove the AI label on Instagram?',
    answer: 'Yes, for new posts you publish after cleaning. Instagram triggers the label when it detects C2PA manifests, IPTC digitalSourceType markers, or generator software credits in file headers. Stripping these tags removes those triggers.',
  },
  {
    question: 'Does cleaning change the picture or its quality?',
    answer: 'No. The picture will look exactly the same after removing the metadata. The tool does not re-encode or recompress pixels through a lossy canvas. The pixel stream remains byte-for-byte identical.',
  },
  {
    question: 'Does it work on images from ChatGPT, DALL·E, Firefly or Gemini?',
    answer: 'Yes. These tools write signed C2PA provenance and IPTC tags upon export. CleanAIMetadata carves out those header segments completely. (Note that pixel watermarks like SynthID are not header metadata).',
  },
  {
    question: 'Can I clean HEIC photos from an iPhone?',
    answer: 'Yes, the tool cleans iPhone HEIC photos and removes embedded camera EXIF, GPS location tags, and device serial markers directly in the browser.',
  },
  {
    question: 'Why did Instagram put an AI label on my real photo?',
    answer: 'Instagram inspects file headers rather than assessing photos visually. If you used Adobe Lightroom or Photoshop features like Generative Fill, Remove, or simple neural filters, those programs inject C2PA manifests and IPTC tags (e.g. compositeWithTrainedAlgorithmicMedia). Stripping metadata removes these false-positive flags.',
  },
  {
    question: 'Does the tool scan my caption or prompt text for AI words?',
    answer: 'No. The scanner never reads your captions or social media post copy. Writing words like "AI" or "Midjourney" in your caption does not trigger automated labels. The tool only reads embedded binary tags written into the image file itself.',
  },
];

export default function FaqAccordion() {
  const [openIndices, setOpenIndices] = useState([0]); // First item open by default

  const toggleFaq = (index) => {
    setOpenIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <section id="faqs-section" className="space-y-6 pt-4 pb-8">
      {/* Section Eyebrow & Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-brand font-mono text-[12px] font-bold uppercase tracking-[0.14em]">
          <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"></span>
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Everything you need to know about AI metadata
        </h2>
        <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
          How our client-side engine guarantees zero-server privacy and removes automated platform flags.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              className="bg-white rounded-panel border border-subtle overflow-hidden shadow-subtle transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full py-4 sm:py-5 px-6 flex items-center justify-between gap-4 text-left hover:bg-card-raised/60 transition-colors"
                aria-expanded={isOpen}
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
  );
}
