import React from 'react';
import {
  ShieldCheck,
  FileCode,
  Sparkles,
  ShieldAlert,
  Layers,
  Search,
  FileImage,
  Lock,
  Zap
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Remove C2PA credentials',
    description: 'Deletes the signed manifests that trigger AI labels on Instagram and Facebook.',
  },
  {
    icon: FileCode,
    title: 'Delete EXIF, IPTC & XMP',
    description: 'Removes GPS, camera serial numbers, timestamps, and device details in one pass.',
  },
  {
    icon: Sparkles,
    title: 'Pixels stay untouched',
    description: 'No canvas re-encoding, so the image looks exactly the same afterwards.',
  },
  {
    icon: ShieldAlert,
    title: 'Avoid false AI labels',
    description: 'Clears the retouching tags that flag real photos edited in Lightroom or Photoshop.',
  },
  {
    icon: Layers,
    title: 'Clean up to 5 photos at once',
    description: '100 MB per batch, downloaded individually or as one ZIP.',
  },
  {
    icon: Search,
    title: 'Inspect tags before cleaning',
    description: 'See every tag in the original, then confirm they are gone in the output.',
  },
  {
    icon: FileImage,
    title: 'Works with common formats',
    description: 'JPEG, PNG, WebP, TIFF, and HEIC files are all supported.',
  },
  {
    icon: Lock,
    title: '100% in-browser',
    description: 'Files are read in browser memory and never sent to a server.',
  },
  {
    icon: Zap,
    title: 'Free, no account',
    description: 'No signup, no subscription, and no watermark on the download.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="space-y-6 pt-4">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Built for creators, photographers & developers
        </h2>
        <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
          Inspect and remove provenance tags before you post.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-panel border border-subtle p-6 space-y-3 shadow-subtle hover:border-subtle-hover hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-card-strong border border-subtle flex items-center justify-center text-muted group-hover:text-brand transition-colors">
                <Icon className="w-4 h-4" />
              </div>

              <h3 className="font-bold text-base text-foreground tracking-tight">
                {feature.title}
              </h3>

              <p className="text-xs sm:text-[13px] text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
