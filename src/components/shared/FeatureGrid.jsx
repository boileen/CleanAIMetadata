import React from 'react';

const FEATURES = [
  {
    index: '01',
    title: 'C2PA & AI Credentials',
    detail: 'Removes signed provenance manifests and edit histories that trigger automated AI labels on social platforms.',
  },
  {
    index: '02',
    title: 'Camera EXIF & GPS Location',
    detail: 'Deletes decimal GPS coordinates, camera serial numbers, exposure timestamps, and device identifiers.',
  },
  {
    index: '03',
    title: 'Lossless Pixel Stream',
    detail: 'Slices container headers directly at the byte level. Image pixels are never re-encoded or compressed.',
  },
  {
    index: '04',
    title: 'ICC Color Profiles Kept',
    detail: 'Retains embedded Display P3 and sRGB profiles so colors and contrast remain identical after cleaning.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          What gets removed
        </h2>
        <span className="text-xs font-mono text-muted">
          Lossless header sanitization · 0 quality loss
        </span>
      </div>

      <div className="bg-white rounded-panel border border-subtle p-6 sm:p-8 shadow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
          {FEATURES.map((item) => (
            <div key={item.index} className="flex items-start gap-4">
              <span className="font-mono text-xs font-bold text-brand bg-brand-soft px-2 py-1 rounded-md shrink-0 mt-0.5">
                {item.index}
              </span>
              <div className="space-y-1">
                <h3 className="text-[14px] sm:text-[15px] font-semibold text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-muted leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
