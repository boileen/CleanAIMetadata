import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Will this remove all metadata, including AI-specific tags?',
    answer: 'Yes. It removes EXIF, IPTC, XMP, C2PA/JUMBF, and PNG text chunks where present. Pixels are not touched.',
  },
  {
    question: 'Can you remove invisible or visual AI watermarks?',
    answer: 'No. Only metadata is removed. Pixel-level marks such as Google SynthID survive and need manual retouching.',
  },
  {
    question: 'Do you store my images? How long are files kept?',
    answer: 'Nothing is stored. Files are read in browser memory and never uploaded, so there is nothing to keep.',
  },
  {
    question: 'What formats and limits are supported?',
    answer: 'JPEG, PNG, WebP, TIFF, and HEIC. Up to 5 images or 100 MB per batch.',
  },
  {
    question: 'Will removing the metadata remove the AI label on Instagram?',
    answer: 'For new posts, yes. Instagram reads C2PA, IPTC digitalSourceType, and generator credits from the header; those are the triggers.',
  },
  {
    question: 'Does cleaning change the picture or its quality?',
    answer: 'No. The image data is copied unchanged, with no re-encoding, so the photo looks identical.',
  },
  {
    question: 'Does it work on images from ChatGPT, DALL·E, Firefly or Gemini?',
    answer: 'Yes. Those exporters write C2PA and IPTC tags, and the tool removes them. Pixel watermarks like SynthID are not header data.',
  },
  {
    question: 'Can I clean HEIC photos from an iPhone?',
    answer: 'Yes. iPhone HEIC files are cleaned along with their EXIF, GPS, and device serial data.',
  },
  {
    question: 'Why did Instagram put an AI label on my real photo?',
    answer: 'Retouching tools such as Photoshop Generative Fill and Lightroom neural filters add C2PA and IPTC markers, which Instagram reads as AI use.',
  },
  {
    question: 'Does the tool scan my caption or prompt text for AI words?',
    answer: 'No. It only reads tags inside the image file. Words in your caption never trigger a label.',
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
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Common questions about AI metadata
        </h2>
        <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
          Short answers on formats, platform labels, and privacy.
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
