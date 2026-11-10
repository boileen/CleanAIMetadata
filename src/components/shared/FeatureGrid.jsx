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
    description: 'We strip C2PA and JUMBF credentials added by cameras, Adobe Photoshop, and generative tools. These records are the primary signals Instagram checks.',
  },
  {
    icon: FileCode,
    title: 'Delete Full EXIF, IPTC & XMP Info',
    description: 'We delete all EXIF, IPTC, and XMP data from your image. GPS coordinates, camera serial numbers, timestamps, and device details go out together.',
  },
  {
    icon: Sparkles,
    title: 'Clean without changing pixels',
    description: 'We strip metadata directly from file headers. We never recompress, resize, or alter image pixels, so your photo looks exactly the same.',
  },
  {
    icon: ShieldAlert,
    title: 'Help prevent false AI labels',
    description: 'Real photos edited in Lightroom or Photoshop can pick up AI flags from simple retouching. Removing those tags prevents automated AI labeling.',
  },
  {
    icon: Layers,
    title: 'Clean up to 5 photos at once',
    description: 'Drop up to 5 images together, 100 MB in total, and clean them in one batch. Download individually or as a single combined .ZIP archive.',
  },
  {
    icon: Search,
    title: 'Inspect every tag before cleaning',
    description: 'Review every EXIF, IPTC, and XMP tag found in your file before you clean it, then confirm the records are permanently gone after cleaning.',
  },
  {
    icon: FileImage,
    title: 'Works with common image formats',
    description: 'Clean JPEG, PNG, WebP, TIFF, and HEIC images before uploading them to your Instagram feed, story, carousel, or website.',
  },
  {
    icon: Lock,
    title: '100% in-browser privacy',
    description: 'Uploaded images are processed purely in temporary browser memory. Files never leave your computer and are never used for training or analytics.',
  },
  {
    icon: Zap,
    title: 'Free with no account required',
    description: 'Upload your image and download the cleaned version immediately. There are no signups, no subscriptions, and no added watermarks.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="space-y-6 pt-4">
      {/* Section Eyebrow & Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-brand font-mono text-[12px] font-bold uppercase tracking-[0.14em]">
          <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"></span>
          UTILITY FEATURES
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Built for creators, photographers & developers
        </h2>
        <p className="text-[14px] sm:text-[15px] text-muted max-w-2xl leading-relaxed">
          Everything needed to inspect, customize, and purge provenance tags across leading social platforms and generative image pipelines.
        </p>
      </div>

      {/* 3x3 Grid matching Unheic Tool Directory */}
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
