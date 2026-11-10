import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'What metadata gets removed?',
    answer: 'EXIF, IPTC, XMP, C2PA Content Credentials, and PNG text chunks. Pixels and colour profiles are left untouched.',
  },
  {
    question: 'Will this stop AI labels on Instagram and Facebook?',
    answer: 'Yes for new posts. Platforms read C2PA manifests and IPTC digitalSourceType tags, which this tool removes.',
  },
  {
    question: 'Why was my real photo tagged as AI?',
    answer: 'Lightroom and Photoshop generative edits write provenance tags into the export. Social apps read those tags and apply the label.',
  },
  {
    question: 'Can you remove pixel watermarks like Google SynthID?',
    answer: 'No. SynthID is embedded in pixel values, not header metadata. Only file headers are modified here.',
  },
  {
    question: 'Are my photos uploaded or stored?',
    answer: 'No. Processing happens inside browser memory. Files never leave your device.',
  },
  {
    question: 'What formats and file sizes are supported?',
    answer: 'JPEG, PNG, WebP, TIFF, and HEIC (including iPhone photos). Up to 5 files or 100 MB per batch.',
  },
  {
    question: 'Does this re-compress or degrade the image?',
    answer: 'No. The image payload is copied verbatim. Only the header segments are edited.',
  },
];

export default function FaqAccordion() {
  const [openIndices, setOpenIndices] = useState([0]);

  const toggleFaq = (index) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faqs-section" className="space-y-4 pt-4 pb-8">
      <h2 className="font-display text-2xl sm:text-3xl text-foreground">
        Frequently asked questions
      </h2>

      <div className="bg-white rounded-panel border border-subtle divide-y divide-subtle shadow-subtle overflow-hidden">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div key={idx}>
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
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
  );
}
