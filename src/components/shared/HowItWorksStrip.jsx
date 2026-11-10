import React from 'react';
import { Eye, Cpu, Scissors, CheckCheck } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Inspect',
    description: 'Read a bounded header in browser memory and estimate tags before touching bytes.',
    icon: Eye,
  },
  {
    number: '02',
    title: 'Scan',
    description: 'Scrutinize C2PA manifests, EXIF parameters, XMP blocks, and generative model signatures.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Strip losslessly',
    description: 'Binary slicer extracts metadata headers without decoding or re-compressing pixels.',
    icon: Scissors,
  },
  {
    number: '04',
    title: 'Verify clean',
    description: 'Check signature, extension, and 0 footprints before saving pristine output or batch ZIP.',
    icon: CheckCheck,
  },
];

export default function HowItWorksStrip() {
  return (
    <section className="space-y-6 pt-4">
      {/* Section Eyebrow & Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-brand font-mono text-[12px] font-bold uppercase tracking-[0.14em]">
          <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"></span>
          A RESULT YOU CAN ACCOUNT FOR
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          How metadata scrubbing works
        </h2>
        <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
          Zero cloud transfer. Every scan and sanitize operation executes purely inside your local browser runtime via native Web APIs.
        </p>
      </div>

      {/* 4-Step Grid matching Unheic Process Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.number}
              className="bg-white rounded-panel border border-subtle p-6 space-y-4 shadow-subtle hover:border-subtle-hover transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl sm:text-2xl font-bold text-brand">
                  {step.number}
                </span>
                <div className="w-9 h-9 rounded-xl bg-card-strong border border-subtle flex items-center justify-center text-muted group-hover:text-brand transition-colors">
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-base sm:text-[17px] text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boundary Callout Note matching Unheic */}
      <div className="p-4 rounded-xl bg-card-raised border border-subtle text-xs sm:text-[13px] text-muted-strong flex items-start gap-3">
        <span className="font-bold text-foreground font-mono shrink-0 uppercase tracking-wider">
          Boundary:
        </span>
        <p>
          Source EXIF, GPS, capture date, C2PA manifests, and prompt records are permanently removed from the cleaned output. The compressed pixel entropy stream remains untouched byte-for-byte.
        </p>
      </div>
    </section>
  );
}
