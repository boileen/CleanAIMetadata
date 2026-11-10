import React from 'react';

const STEPS = [
  { number: '1', title: 'Inspect headers' },
  { number: '2', title: 'Locate AI and camera tags' },
  { number: '3', title: 'Strip metadata blocks' },
  { number: '4', title: 'Verify pixel match' },
];

export default function HowItWorksStrip() {
  return (
    <section className="pt-2">
      <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 divide-y md:divide-y-0 md:divide-x divide-subtle">
          {STEPS.map((step) => (
            <div key={step.number} className="flex items-center gap-3 pt-3 md:pt-0 md:px-4 first:pt-0 first:px-0">
              <span className="font-display text-2xl text-brand leading-none">
                {step.number}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
