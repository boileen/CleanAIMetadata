import React from 'react';
import {
  Camera,
  Eraser,
  Image as ImageIcon,
  Info,
  MapPin,
  Palette,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { METADATA_TABS, FORMAT_NOTES } from '../../../config/metadataSchema';
import { METADATA_PRESETS } from '../../../config/metadataPresets';

function ModeCard({ active, onClick, icon: Icon, title, description, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition-all ${
        active
          ? 'border-brand/50 bg-brand-soft/50 shadow-subtle'
          : 'border-subtle bg-card-raised hover:bg-card-strong/40'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
            active
              ? 'border-brand/20 bg-white text-brand'
              : 'border-subtle bg-white text-muted'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            {title}
            {badge && (
              <span className="rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
                {badge}
              </span>
            )}
          </span>
          <span className="block text-[11px] leading-relaxed text-muted">{description}</span>
        </span>
        <span
          className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
            active ? 'border-brand bg-brand' : 'border-subtle bg-white'
          }`}
        >
          {active && <span className="block h-full w-full scale-50 rounded-full bg-white" />}
        </span>
      </div>
    </button>
  );
}

function PresetIcon({ type }) {
  if (type === 'phone') return <Smartphone className="w-3.5 h-3.5" />;
  return <Camera className="w-3.5 h-3.5" />;
}

export default function EditorSidebar({
  previewUrl,
  fileInfo,
  mode,
  setMode,
  onBrowse,
  values,
  applyPreset,
  filledByTab,
  filledCount,
  onClearValues,
}) {
  const dimensions = fileInfo?.dimensions;
  const gpsSet =
    String(values.gpsLatitude ?? '').trim() !== '' &&
    String(values.gpsLongitude ?? '').trim() !== '';

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-panel border border-subtle bg-white shadow-subtle">
        <div className="relative aspect-[4/3] bg-card-strong">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={fileInfo?.name || 'Selected photo'}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageIcon className="w-7 h-7" />
            </div>
          )}
          <span className="absolute right-2.5 top-2.5 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            {fileInfo?.formatLabel || 'IMAGE'}
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-foreground" title={fileInfo?.name}>
              {fileInfo?.name}
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-muted">
              {fileInfo?.size}
              {dimensions ? ` · ${dimensions.width} × ${dimensions.height} px` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-card-strong px-2 py-1 text-[10px] font-semibold text-muted-strong">
              <Palette className="w-3 h-3" />
              {fileInfo?.iccPresent ? 'ICC profile found' : 'No ICC profile'}
            </span>
            {gpsSet && (
              <span className="inline-flex items-center gap-1 rounded-md bg-risk-amber-bg px-2 py-1 text-[10px] font-semibold text-risk-amber-text">
                <MapPin className="w-3 h-3" />
                Location set
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-1 text-[10px] font-semibold text-brand">
              <ShieldCheck className="w-3 h-3" />
              Lossless pixels
            </span>
          </div>

          <button
            type="button"
            onClick={onBrowse}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-subtle bg-card-raised px-3 py-2.5 text-xs font-semibold text-muted-strong transition-colors hover:border-subtle-hover hover:bg-card-strong"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Choose a different photo
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-panel border border-subtle bg-white p-4 shadow-subtle">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
            Existing metadata
          </h3>
          {mode === 'remove' && filledCount > 0 && (
            <button
              type="button"
              onClick={onClearValues}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-risk-rose-text hover:underline"
            >
              <Trash2 className="w-3 h-3" />
              Clear fields
            </button>
          )}
        </div>

        <div className="space-y-2">
          <ModeCard
            active={mode === 'preserve'}
            onClick={() => setMode('preserve')}
            icon={ShieldCheck}
            title="Keep & overwrite"
            badge="Safer"
            description="Rebuilds EXIF, IPTC and XMP from the fields below and keeps the ICC colour profile. Maker notes and unknown vendor tags are dropped."
          />
          <ModeCard
            active={mode === 'remove'}
            onClick={() => setMode('remove')}
            icon={Eraser}
            title="Remove, then write"
            description="Deletes every metadata carrier first—including C2PA and AI manifests—then writes only the fields below. ICC colour is preserved."
          />
        </div>

        {mode === 'remove' && filledCount > 0 && (
          <p className="rounded-lg border border-risk-amber-border bg-risk-amber-bg px-2.5 py-2 text-[10px] leading-relaxed text-risk-amber-text">
            Pre-filled values count as selected fields. Clear anything you do not want in
            the output.
          </p>
        )}

        <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          {FORMAT_NOTES[fileInfo?.format] || 'Standard metadata is rebuilt from the values in the editor.'}
        </p>
      </div>

      <div className="space-y-3 rounded-panel border border-subtle bg-white p-4 shadow-subtle">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
            Camera presets
          </h3>
        </div>

        <div className="space-y-1.5">
          {METADATA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group flex w-full items-center gap-2.5 rounded-xl border border-subtle bg-card-raised p-2.5 text-left transition-all hover:border-brand/30 hover:bg-brand-soft/40"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-subtle bg-white text-muted transition-colors group-hover:text-brand">
                <PresetIcon type={preset.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-foreground">
                  {preset.name}
                </span>
                <span className="block truncate text-[10px] text-muted">
                  {preset.subtitle}
                </span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-brand opacity-70 transition-opacity group-hover:opacity-100">
                Apply
              </span>
            </button>
          ))}
        </div>

        <p className="text-[10px] leading-relaxed text-muted">
          Presets only fill camera, lens and software fields. Rights and location values
          are never changed automatically.
        </p>
      </div>

      <div className="space-y-2.5 rounded-panel border border-subtle bg-white p-4 shadow-subtle">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
          Process summary
        </h3>

        <div className="space-y-1.5">
          {METADATA_TABS.map((tab) => (
            <div key={tab.id} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="font-semibold text-muted-strong">{tab.label}</span>
              <span className="font-mono text-muted">
                {filledByTab[tab.id] || 0} field{(filledByTab[tab.id] || 0) === 1 ? '' : 's'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 border-t border-subtle/70 pt-1.5 text-[11px]">
            <span className="font-semibold text-foreground">Total selected</span>
            <span className="font-mono font-bold text-brand">{filledCount}</span>
          </div>
        </div>

        <p className="text-[10px] leading-relaxed text-muted">
          {mode === 'remove'
            ? 'Output: stripped container with only the selected tags re-injected.'
            : 'Output: new standard tags; ICC and container structure kept.'}
        </p>
      </div>
    </aside>
  );
}
