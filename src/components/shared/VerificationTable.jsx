import React from 'react';
import { Check } from 'lucide-react';

const POLICY_ROWS = [
  {
    signal: 'C2PA / JUMBF Manifest',
    policy: 'Stripped',
    effect: 'Removes the signed origin records that trigger "AI Info" labels on social platforms.',
  },
  {
    signal: 'Camera EXIF & Decimal GPS',
    policy: 'Stripped',
    effect: 'Deletes camera make, model, lens, serial number, exposure settings, and coordinates.',
  },
  {
    signal: 'IPTC & XMP Prompt Blocks',
    policy: 'Stripped',
    effect: 'Removes generator prompts, seed values, sampler settings, and Photoshop edit history.',
  },
  {
    signal: 'Compressed Pixel Stream',
    policy: '100% Untouched',
    effect: 'No re-compression or canvas pass. Image data stays identical.',
  },
  {
    signal: 'Embedded ICC Profiles (APP2)',
    policy: 'Preserved',
    effect: 'Colour profiles such as sRGB and Display P3 are kept, so colours render the same.',
  },
];

function PolicyPill({ policy }) {
  const isStripped = policy === 'Stripped';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
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
    <section id="verification-section" className="space-y-12 pt-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What gets removed and what is kept
          </h2>
          <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
            What the tool does to each block in your file.
          </p>
        </div>

        {/* Desktop: three-column table */}
        <div className="hidden md:block bg-white rounded-panel border border-subtle overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs sm:text-[13px]">
              <thead className="bg-card-raised border-b border-subtle text-foreground font-mono font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5">Signal / Header</th>
                  <th className="py-3.5 px-4 sm:px-5">Output Policy</th>
                  <th className="py-3.5 px-4 sm:px-5">Practical Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/60 text-muted-strong">
                {POLICY_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-card-raised/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5 font-mono font-semibold text-foreground whitespace-nowrap">
                      {row.signal}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      <PolicyPill policy={row.policy} />
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-muted leading-relaxed">
                      {row.effect}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: stacked cards so nothing scrolls sideways */}
        <div className="md:hidden space-y-3">
          {POLICY_ROWS.map((row, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-subtle p-4 shadow-subtle space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-mono text-[13px] font-bold text-foreground leading-snug">
                  {row.signal}
                </h3>
                <PolicyPill policy={row.policy} />
              </div>
              <p className="text-[13px] text-muted leading-relaxed">{row.effect}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Short explainer — the long platform essay now lives in the FAQ */}
      <div className="bg-white rounded-panel border border-subtle p-6 sm:p-10 shadow-subtle space-y-4 text-muted-strong leading-relaxed">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          What is an AI metadata footprint?
        </h2>
        <p className="text-sm sm:text-[15px] text-muted leading-relaxed">
          It is header data written into an image file that records how the image was made. The tool
          name, generation settings, edit history, and timestamps are stored in four containers:{' '}
          <span className="font-mono text-foreground font-semibold">EXIF</span>,{' '}
          <span className="font-mono text-foreground font-semibold">IPTC</span>,{' '}
          <span className="font-mono text-foreground font-semibold">XMP</span>, and{' '}
          <span className="font-mono text-foreground font-semibold">C2PA</span>.
        </p>
        <p className="text-sm sm:text-[15px] text-muted leading-relaxed">
          C2PA Content Credentials carry a signed manifest saying whether an AI generator such as
          Firefly or DALL·E was used. The IPTC{' '}
          <span className="font-mono text-foreground">digitalSourceType</span> field does the same with
          a tag such as{' '}
          <span className="font-mono text-brand font-semibold">trainedAlgorithmicMedia</span>. Both are
          removed here.
        </p>
      </div>
    </section>
  );
}
