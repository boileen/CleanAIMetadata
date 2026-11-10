import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Trash2,
  Check,
  Copy,
  Download,
  HelpCircle,
  Info,
  ChevronDown,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';
import { useWorkspace } from '../context/WorkspaceContext';

// Shared Components
import UploadDropzone from '../components/shared/UploadDropzone';

// Tool Components
import FileSwitcherBar from '../components/tools/FileSwitcherBar';
import MapPicker from '../components/tools/MapPicker';

// Geotag editor hook
import useGeoTagEditor from '../hooks/useGeoTagEditor';

/** Empty form state — also the reset baseline when a new photo is loaded. */
const DEFAULT_COORDS = {
  latitude: '',
  longitude: '',
  altitude: '',
  altitudeRef: 'above',
  keywords: '',
  description: '',
  direction: '',
  directionRef: 'true',
  gpsDate: '',
  gpsTime: '',
  speed: '',
  speedUnit: 'K',
  removeOtherMetadata: true,
};

const GEOTAG_FAQS = [
  {
    question: 'How to get Latitude and Longitude for any Location?',
    answer:
      'In Google Maps, right-click a point on desktop to see the coordinates. On mobile, touch and hold the map until a pin drops. Latitude comes first, longitude second.',
  },
  {
    question: 'How do I geotag a photo?',
    answer:
      'Upload the photo, enter the coordinates or pick them on the map, then click "Save Location". The file downloads with the new GPS tags written in.',
  },
  {
    question: 'What format do GPS coordinates use?',
    answer:
      'Signed decimal degrees. Latitude runs from -90 to 90 and longitude from -180 to 180, with north and east positive. The tool handles the N/S/E/W tags.',
  },
  {
    question: 'How do I remove GPS data from a photo?',
    answer:
      'Upload the photo and click "Remove Location". Every GPS tag is cleared while camera exposure, copyright, and other fields stay intact.',
  },
  {
    question: 'Does geotagging change the photo itself?',
    answer: 'No. Only the metadata changes. The pixels are not re-compressed.',
  },
];

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 px-3 rounded-xl bg-card-raised border border-subtle">
      <div className="space-y-0.5 flex-1 min-w-0">
        <span className="block text-xs font-bold text-foreground leading-snug">{label}</span>
        {hint && <span className="block text-[11px] text-muted leading-relaxed">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-brand' : 'bg-subtle'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function FieldLabel({ children, tooltip }) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
        {children}
      </label>
      {tooltip && (
        <span title={tooltip} className="text-muted/60 cursor-help">
          <HelpCircle className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, type = 'text', step, min, max }) {
  return (
    <input
      type={type}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-card-raised border border-subtle text-xs font-mono text-foreground focus:outline-none focus:border-brand transition-colors"
    />
  );
}

function ProgressBar({ progress, label }) {
  return (
    <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-3 text-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
      <p className="text-sm font-bold text-foreground">{label || 'Processing…'}</p>
      <div className="w-full h-2 bg-card-strong rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        />
      </div>
      <p className="text-xs text-muted">{progress}% complete</p>
    </div>
  );
}

/** Format a coordinate for display without trailing zeros. */
function formatCoordinate(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '';
  return String(parseFloat(num.toFixed(6)));
}

/**
 * Shows the GPS location that was found inside the uploaded photo, before any
 * edits are applied. This is the "where was this picture taken?" answer.
 */
function LocationReadout({ gps }) {
  const [copied, setCopied] = useState(false);

  const hasGps = gps?.latitude != null && gps?.longitude != null;
  const coordsText = hasGps
    ? `${formatCoordinate(gps.latitude)}, ${formatCoordinate(gps.longitude)}`
    : '';
  const hasAltitude = hasGps && gps.altitude != null && Number.isFinite(Number(gps.altitude));

  const handleCopy = async () => {
    if (!coordsText) return;
    try {
      await navigator.clipboard.writeText(coordsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard API blocked — the coordinates are still selectable on screen. */
    }
  };

  if (!hasGps) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-xl bg-card-raised border border-subtle">
        <MapPin className="w-4 h-4 text-muted shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-bold text-foreground">No GPS location in this photo</p>
          <p className="text-[11px] text-muted leading-relaxed">
            This image does not reveal where it was taken. Enter coordinates below to add a location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-brand-soft/60 border border-brand/20">
      <div className="flex items-start gap-2 min-w-0">
        <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand/80">
            Location in this photo
          </p>
          <p className="text-xs font-mono font-bold text-foreground break-all">{coordsText}</p>
          {hasAltitude && (
            <p className="text-[11px] text-muted font-mono">
              Altitude: {formatCoordinate(gps.altitude)} m
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Coordinates copied' : 'Copy coordinates'}
        title={copied ? 'Copied!' : 'Copy coordinates'}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-brand/20 text-brand hover:bg-brand hover:text-white transition-colors shrink-0"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function GeoTagPage() {
  const seo = SEO_CONFIG.geoTag;
  const schema = getWebApplicationSchema(seo);
  const { files, addFiles } = useWorkspace();
  const geo = useGeoTagEditor();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const hasFiles = files && files.length > 0;

  // Form state
  const [coords, setCoords] = useState({ ...DEFAULT_COORDS });

  // Pre-fill lat/lng/altitude from the file that was just loaded. Resetting the
  // rest prevents a previous photo's GPS details from leaking into a new upload.
  useEffect(() => {
    if (!geo.entry) return;
    const gps = geo.existingGps;
    setCoords((prev) => ({
      ...DEFAULT_COORDS,
      removeOtherMetadata: prev.removeOtherMetadata,
      latitude: gps?.latitude ?? '',
      longitude: gps?.longitude ?? '',
      altitude: gps?.altitude ?? '',
    }));
  }, [geo.entry, geo.existingGps]);

  // When a file is added to workspace, also load it into the geo editor
  useEffect(() => {
    const latestFile = files?.[files.length - 1]?.originalFile;
    if (latestFile) geo.selectFile(latestFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files?.length]);

  // Auto-download once processing is done
  useEffect(() => {
    if (geo.status === 'done' && geo.result?.url) {
      geo.download();
    }
  }, [geo.status, geo.result?.url]);

  const set = (key) => (value) => setCoords((prev) => ({ ...prev, [key]: value }));
  const handleCoordinatesChange = (patch) => setCoords((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    geo.saveLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude,
      altitudeRef: coords.altitudeRef,
      direction: coords.direction,
      directionRef: coords.directionRef,
      speed: coords.speed,
      speedUnit: coords.speedUnit,
      gpsDate: coords.gpsDate,
      gpsTime: coords.gpsTime,
      description: coords.description,
      keywords: coords.keywords,
      removeOtherMetadata: coords.removeOtherMetadata,
    });
  };

  const handleRemove = () => {
    geo.removeLocation();
  };

  const isProcessing = geo.status === 'processing';
  const isDone = geo.status === 'done';

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={schema}
      />

      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2 pb-1">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            Add or Remove <span className="text-brand">Photo GPS Tags</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            View, edit, or clear decimal coordinates from your photos in the browser.
          </p>
        </div>

        {/* STATE 1: empty — show shared dropzone */}
        {!hasFiles && (
          <UploadDropzone
            onFiles={(fileList) => addFiles(fileList)}
            multiple
            title="Drag & drop your images here"
            subtitle="JPEG, PNG, WebP, TIFF, or HEIC up to 100MB"
            buttonLabel="Upload"
            inputId="geotag-file-input"
          />
        )}

        {/* STATE 2: active workspace */}
        {hasFiles && (
          <div className="space-y-6 animate-fadeIn">

            <FileSwitcherBar onAddMoreClick={() => {
              const inp = document.getElementById('geotag-add-more');
              inp?.click();
            }} />
            <input
              type="file"
              id="geotag-add-more"
              multiple
              accept="image/jpeg,image/png,image/webp,image/tiff,image/heic"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {/* Global error banner */}
            {geo.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-risk-rose-border bg-risk-rose-bg px-4 py-3 text-xs sm:text-[13px] text-risk-rose-text">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{geo.error}</span>
              </div>
            )}

            {/* Processing overlay */}
            {isProcessing && (
              <ProgressBar progress={geo.progress} label={geo.progressLabel} />
            )}

            {/* Unsupported format notice */}
            {geo.isUnsupported && !isProcessing && (
              <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-foreground">
                  {String(geo.format || '').toUpperCase()} files cannot be edited in-browser
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  GPS writing is supported for JPEG, PNG and WebP. Convert your file to one of
                  those formats first, then re-upload.
                </p>
              </div>
            )}

            {/* Main workspace — only shown when format is supported */}
            {!isProcessing && geo.isSupported && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT: Map (7 cols) */}
                <div className="lg:col-span-7">
                  <MapPicker
                    coordinates={coords}
                    onCoordinatesChange={handleCoordinatesChange}
                  />
                </div>

                {/* RIGHT: Preview + form (5 cols) */}
                <div className="lg:col-span-5 space-y-4">

                  {/* Photo preview */}
                  <div className="bg-white rounded-panel border border-subtle p-4 shadow-subtle space-y-3">
                    <div className="relative aspect-video max-h-[200px] rounded-xl bg-card-strong border border-subtle overflow-hidden flex items-center justify-center">
                      {geo.previewUrl ? (
                        <img
                          src={geo.previewUrl}
                          alt={geo.entry?.file?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-mono text-muted">No Image</span>
                      )}
                      {geo.format && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-xs font-bold uppercase">
                          {geo.format === 'jpeg' ? 'JPG' : geo.format.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate max-w-[180px]">
                        {geo.entry?.file?.name}
                      </span>
                      {geo.hasGpsData && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft text-brand text-[10px] font-mono font-bold">
                          <MapPin className="w-3 h-3" />
                          GPS Active
                        </span>
                      )}
                    </div>

                    {/* Where this photo was taken (read from the file on upload) */}
                    <LocationReadout gps={geo.existingGps} />

                    {/* Done result row */}
                    {isDone && geo.result && (
                      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-brand-soft/60 border border-brand/20">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-brand shrink-0" />
                          <span className="text-xs font-bold text-brand">{geo.result.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={geo.download}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Location form */}
                  <div className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-subtle/50">
                      <h3 className="font-bold text-sm text-foreground">Enter Location Details</h3>
                      <a
                        href="#gps-guide"
                        className="text-[11px] text-brand hover:underline flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Learn how to get co-ordinates
                      </a>
                    </div>

                    {/* Latitude */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="Signed decimal degrees, -90 to 90. Positive = North.">
                        Latitude
                      </FieldLabel>
                      <FieldInput
                        type="number"
                        step="any"
                        value={coords.latitude}
                        onChange={(e) => handleCoordinatesChange({ latitude: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                        placeholder="e.g. 37.7749"
                      />
                    </div>

                    {/* Longitude */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="Signed decimal degrees, -180 to 180. Positive = East.">
                        Longitude
                      </FieldLabel>
                      <FieldInput
                        type="number"
                        step="any"
                        value={coords.longitude}
                        onChange={(e) => handleCoordinatesChange({ longitude: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                        placeholder="e.g. -122.4194"
                      />
                    </div>

                    {/* Altitude */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="Height above (or below) sea level in metres.">
                        Altitude
                      </FieldLabel>
                      <div className="flex gap-2">
                        <FieldInput
                          type="number"
                          step="any"
                          value={coords.altitude}
                          onChange={(e) => handleCoordinatesChange({ altitude: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                          placeholder="e.g. 12.5"
                        />
                        <select
                          value={coords.altitudeRef}
                          onChange={(e) => set('altitudeRef')(e.target.value)}
                          className="px-2 py-2 rounded-xl bg-card-raised border border-subtle text-xs font-mono text-foreground focus:outline-none focus:border-brand shrink-0"
                        >
                          <option value="above">Above sea level</option>
                          <option value="below">Below sea level</option>
                        </select>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="IPTC keywords, comma-separated.">
                        Keywords
                      </FieldLabel>
                      <FieldInput
                        value={coords.keywords}
                        onChange={(e) => set('keywords')(e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="Written into EXIF ImageDescription and IPTC Caption.">
                        Description
                      </FieldLabel>
                      <FieldInput
                        value={coords.description}
                        onChange={(e) => set('description')(e.target.value)}
                        placeholder="e.g. Sunset over the harbour"
                      />
                    </div>

                    {/* Image direction */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="Compass bearing the camera faced, 0–360°.">
                        Image direction
                      </FieldLabel>
                      <div className="flex gap-2">
                        <FieldInput
                          type="number"
                          step="any"
                          min="0"
                          max="360"
                          value={coords.direction}
                          onChange={(e) => set('direction')(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="e.g. 90.5"
                        />
                        <select
                          value={coords.directionRef}
                          onChange={(e) => set('directionRef')(e.target.value)}
                          className="px-2 py-2 rounded-xl bg-card-raised border border-subtle text-xs font-mono text-foreground focus:outline-none focus:border-brand shrink-0"
                        >
                          <option value="true">True north</option>
                          <option value="magnetic">Magnetic</option>
                        </select>
                      </div>
                    </div>

                    {/* GPS Date */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="UTC date the GPS fix was taken.">
                        GPS date (UTC)
                      </FieldLabel>
                      <FieldInput
                        type="date"
                        value={coords.gpsDate}
                        onChange={(e) => set('gpsDate')(e.target.value)}
                        placeholder="mm/dd/yyyy"
                      />
                    </div>

                    {/* GPS Time */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="UTC time the GPS fix was taken.">
                        GPS time (UTC)
                      </FieldLabel>
                      <FieldInput
                        type="time"
                        step="1"
                        value={coords.gpsTime}
                        onChange={(e) => set('gpsTime')(e.target.value)}
                        placeholder="HH:MM:SS"
                      />
                    </div>

                    {/* Speed */}
                    <div className="space-y-1">
                      <FieldLabel tooltip="Speed of GPS receiver at capture time.">
                        Speed
                      </FieldLabel>
                      <div className="flex gap-2">
                        <FieldInput
                          type="number"
                          step="any"
                          min="0"
                          value={coords.speed}
                          onChange={(e) => set('speed')(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="e.g. 12"
                        />
                        <select
                          value={coords.speedUnit}
                          onChange={(e) => set('speedUnit')(e.target.value)}
                          className="px-2 py-2 rounded-xl bg-card-raised border border-subtle text-xs font-mono text-foreground focus:outline-none focus:border-brand shrink-0"
                        >
                          <option value="K">km/h</option>
                          <option value="M">mph</option>
                          <option value="N">knots</option>
                        </select>
                      </div>
                    </div>

                    {/* Remove all other metadata toggle */}
                    <Toggle
                      checked={coords.removeOtherMetadata}
                      onChange={set('removeOtherMetadata')}
                      label="Remove All Other Metadata"
                      hint={
                        coords.removeOtherMetadata
                          ? 'On: removes all other metadata when you save, but keeps the location details you set.'
                          : 'Off: other metadata in the photo stays as it is.'
                      }
                    />

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-subtle/50">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-sm transition-all hover:enabled:-translate-y-0.5"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing…
                          </>
                        ) : isDone ? (
                          <>
                            <Check className="w-4 h-4" />
                            Saved. Click to re-save
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Save Location
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleRemove}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-subtle bg-white hover:bg-card-strong disabled:opacity-60 disabled:cursor-not-allowed text-muted hover:text-risk-rose-text text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Location
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQs */}
        <section className="space-y-4 pt-2 pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>

          <div className="bg-white rounded-panel border border-subtle divide-y divide-subtle shadow-subtle overflow-hidden">
            {GEOTAG_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-4 px-6 flex items-center justify-between gap-4 text-left hover:bg-card-raised/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-4 pt-0 text-sm text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
