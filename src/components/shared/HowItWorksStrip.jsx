import React from 'react';
import { Eye, Cpu, Scissors, CheckCheck } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Inspect',
    description: 'Opens the file and lists every metadata block it finds.',
    icon: Eye,
  },
  {
    number: '02',
    title: 'Scan',
    description: 'Flags AI manifests, camera EXIF, XMP, and prompt records.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Strip',
    description: 'Cuts those blocks out without re-encoding the pixels.',
    icon: Scissors,
  },
  {
    number: '04',
    title: 'Verify',
    description: 'Re-reads the output and confirms nothing is left behind.',
    icon: CheckCheck,
  },
];

export default function HowItWorksStrip() {
  return (
    <section className="space-y-6 pt-4">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          How metadata scrubbing works
        </h2>
        <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
          Four steps, all inside your browser. Nothing is uploaded.
        </p>
      </div>

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
    </section>
  );
}
