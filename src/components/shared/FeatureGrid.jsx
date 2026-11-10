import React from 'react';

const FEATURES = [
  {
    title: 'C2PA credentials',
    detail: 'Signed origin manifests that trigger platform AI labels.',
  },
  {
    title: 'Camera EXIF and GPS',
    detail: 'Coordinates, camera serials, timestamps, and lens data.',
  },
  {
    title: 'IPTC and XMP prompts',
    detail: 'Generator seeds, prompts, and Photoshop edit history.',
  },
  {
    title: 'Pixel integrity',
    detail: 'Zero re-compression. Output bytes match the original stream.',
  },
  {
    title: 'ICC profiles kept',
    detail: 'Display P3 and sRGB colour profiles remain intact.',
  },
  {
    title: 'Standard formats',
    detail: 'JPEG, PNG, WebP, TIFF, and iPhone HEIC up to 100 MB.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="space-y-4 pt-4">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        What gets removed
      </h2>

      <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle divide-y divide-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 pb-2">
          {FEATURES.map((item) => (
            <div key={item.title} className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
