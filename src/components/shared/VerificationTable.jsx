import React from 'react';
import { Check } from 'lucide-react';

const POLICY_ROWS = [
  {
    signal: 'C2PA / JUMBF Manifest',
    policy: 'Stripped',
    effect: 'Removes signed origin records that trigger AI labels on social platforms.',
  },
  {
    signal: 'Camera EXIF & Decimal GPS',
    policy: 'Stripped',
    effect: 'Deletes camera make, model, lens, serial, exposure settings, and coordinates.',
  },
  {
    signal: 'IPTC & XMP Prompt Blocks',
    policy: 'Stripped',
    effect: 'Removes generator prompts, seeds, sampler settings, and edit history.',
  },
  {
    signal: 'Compressed Pixel Stream',
    policy: 'Untouched',
    effect: 'No re-compression. Original pixel data stays byte-identical.',
  },
  {
    signal: 'Embedded ICC Profiles',
    policy: 'Preserved',
    effect: 'Colour profiles such as sRGB and Display P3 remain intact.',
  },
];

function PolicyPill({ policy }) {
  const isStripped = policy === 'Stripped';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isStripped
          ? 'bg-brand-soft text-brand'
          : 'bg-card-strong text-muted-strong border border-subtle'
      }`}
    >
      {isStripped && <Check className="w-3 h-3 text-brand" />}
      {policy}
    </span>
  );
}

export default function VerificationTable() {
  return (
    <section id="verification-section" className="space-y-4 pt-4">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        What stays and what goes
      </h2>

      {/* Desktop: three-column table */}
      <div className="hidden md:block bg-white rounded-panel border border-subtle overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs sm:text-[13px]">
          <thead className="bg-card-raised border-b border-subtle text-foreground text-xs font-semibold">
            <tr>
              <th className="py-3 px-5">Signal</th>
              <th className="py-3 px-5">Policy</th>
              <th className="py-3 px-5">Effect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle text-muted-strong">
            {POLICY_ROWS.map((row, idx) => (
              <tr key={idx} className="hover:bg-card-raised/40 transition-colors">
                <td className="py-3 px-5 font-semibold text-foreground whitespace-nowrap">
                  {row.signal}
                </td>
                <td className="py-3 px-5 whitespace-nowrap">
                  <PolicyPill policy={row.policy} />
                </td>
                <td className="py-3 px-5 text-muted leading-relaxed">
                  {row.effect}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-2.5">
        {POLICY_ROWS.map((row, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-subtle p-4 shadow-subtle space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {row.signal}
              </span>
              <PolicyPill policy={row.policy} />
            </div>
            <p className="text-xs text-muted leading-relaxed">{row.effect}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
