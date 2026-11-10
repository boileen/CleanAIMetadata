import React from 'react';
import { Check } from 'lucide-react';

const POLICY_ROWS = [
  {
    signal: 'C2PA / JUMBF Manifest',
    policy: 'Stripped',
    effect: 'Removes the signed origin records that trigger automated "AI Info" or "Made with AI" labels on Instagram, Facebook, Threads, and TikTok.',
  },
  {
    signal: 'Camera EXIF & Decimal GPS',
    policy: 'Stripped',
    effect: 'Permanently deletes camera make, model, lens details, serial numbers, exposure settings, and exact latitude/longitude coordinates.',
  },
  {
    signal: 'IPTC & XMP Prompt Blocks',
    policy: 'Stripped',
    effect: 'Removes Stable Diffusion / Midjourney prompt strings, seed numbers, sampler configuration, and Adobe Photoshop edit histories.',
  },
  {
    signal: 'Compressed Pixel Stream',
    policy: '100% Untouched',
    effect: 'Zero re-compression via HTML5 <canvas>. Pixels remain byte-for-byte identical with zero color shift or quality loss.',
  },
  {
    signal: 'Embedded ICC Profiles (APP2)',
    policy: 'Preserved',
    effect: 'Color gamut integrity, sRGB, and Display P3 profiles are retained for faithful color rendering.',
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
      
      {/* 1. Policy Table matching Unheic "What survives the browser path?" */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-brand font-mono text-[12px] font-bold uppercase tracking-[0.14em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"></span>
            VERIFIED POLICY
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What survives the browser path?
          </h2>
          <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
            These outcomes reflect our binary header stripper—not an arbitrary compression guess.
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

      {/* 2. Deep Educational SEO Guide from DeleteFootprints */}
      <div className="bg-white rounded-panel border border-subtle p-6 sm:p-10 shadow-subtle space-y-8 text-muted-strong leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Learn more about image metadata and AI footprints
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Understanding why social media platforms automatically flag content and how header metadata differs from pixel-level watermarks.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            What is an AI image metadata footprint?
          </h3>
          <p className="text-sm sm:text-[15px] text-muted leading-relaxed">
            An AI image metadata footprint is embedded header data that records how an image was generated or retouched. 
            It records the tool name, generation settings, edit history, timestamps, and origin attribution. Four metadata containers 
            typically store this information: <span className="font-mono text-foreground font-semibold">EXIF</span>, <span className="font-mono text-foreground font-semibold">IPTC</span>, <span className="font-mono text-foreground font-semibold">XMP</span>, and <span className="font-mono text-foreground font-semibold">C2PA</span>.
          </p>
          <p className="text-sm sm:text-[15px] text-muted leading-relaxed">
            C2PA Content Credentials add a cryptographically signed manifest declaring whether an AI image generator (like Adobe Firefly or DALL·E 3) 
            was used. IPTC's <span className="font-mono text-foreground">digitalSourceType</span> field stamps machine-readable tags like <span className="font-mono text-brand font-semibold">trainedAlgorithmicMedia</span> into the file.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Why social platforms add "Made with AI" labels
          </h3>
          <p className="text-sm sm:text-[15px] text-muted leading-relaxed">
            Platforms like Instagram and Facebook do not scan pixels by eye—they inspect binary file headers during upload. 
            When they encounter a signed C2PA manifest or an IPTC algorithmic marker, their automated pipeline immediately applies an 
            "AI Info" badge. Stripping these containers in browser memory allows creators to publish without automated platform false-positives.
          </p>
        </div>
      </div>

    </section>
  );
}
