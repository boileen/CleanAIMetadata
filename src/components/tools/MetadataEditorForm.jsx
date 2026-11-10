import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  Smartphone, 
  RotateCcw, 
  Download, 
  Check, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const TABS = [
  { id: 'creator', label: 'Creator & Copyright', icon: UserCheck },
  { id: 'camera', label: 'Camera & Lens', icon: Camera },
  { id: 'datetime', label: 'Date & Time', icon: Calendar },
];

const PRESETS = {
  canon: {
    name: 'DSLR Camera (Canon EOS R5)',
    make: 'Canon',
    model: 'Canon EOS R5',
    lens: 'RF 24-70mm F2.8L IS USM',
    software: 'Adobe Photoshop Lightroom Classic 13.2 (Windows)',
    artist: 'Professional Photographer',
    copyright: `© ${new Date().getFullYear()} All Rights Reserved`,
  },
  iphone: {
    name: 'Smartphone (iPhone 15 Pro)',
    make: 'Apple',
    model: 'iPhone 15 Pro',
    lens: 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
    software: '17.5.1',
    artist: 'Mobile Creator',
    copyright: `© ${new Date().getFullYear()} Mobile Capture`,
  },
  clearAi: {
    name: 'Clear All AI Provenance Only',
    make: 'Sony',
    model: 'ILCE-7RM5',
    lens: 'FE 24-70mm F2.8 GM II',
    software: 'Capture One 23 Pro',
    artist: 'Visual Artist',
    copyright: `© ${new Date().getFullYear()} Verified Clean`,
  }
};

export default function MetadataEditorForm({ activeFile }) {
  const [activeTab, setActiveTab] = useState('creator');
  const [mode, setMode] = useState('remove'); // 'remove' (clean slate) or 'preserve' (overwrite only)
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    artist: '',
    copyright: '',
    description: '',
    userComment: '',
    make: '',
    model: '',
    lens: '',
    software: '',
    dateTimeOriginal: '',
    createDate: '',
  });

  // Prepopulate form when activeFile changes
  useEffect(() => {
    if (activeFile && activeFile.metadata) {
      const meta = activeFile.metadata;
      setFormData({
        artist: meta.iptc?.Artist || meta.exif?.Artist || '',
        copyright: meta.iptc?.Copyright || meta.exif?.Copyright || `© ${new Date().getFullYear()} All Rights Reserved`,
        description: meta.iptc?.Caption || meta.exif?.ImageDescription || '',
        userComment: meta.exif?.UserComment || '',
        make: meta.exif?.Make || '',
        model: meta.exif?.Model || '',
        lens: meta.exif?.LensModel || '',
        software: meta.exif?.Software || '',
        dateTimeOriginal: meta.exif?.DateTimeOriginal || new Date().toISOString().slice(0, 16),
        createDate: meta.exif?.CreateDate || new Date().toISOString().slice(0, 16),
      });
    }
  }, [activeFile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      make: preset.make,
      model: preset.model,
      lens: preset.lens,
      software: preset.software,
      artist: preset.artist,
      copyright: preset.copyright,
    }));
  };

  const setDateToNow = () => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      dateTimeOriginal: now,
      createDate: now,
    }));
  };

  const handleSaveAndDownload = () => {
    // Mock save & download for skeleton phase
    setSavedSuccess(true);
    setTimeout(() => {
      // Create a dummy download link using the preview URL or a placeholder blob
      const link = document.createElement('a');
      link.href = activeFile?.previewUrl || '#';
      link.download = `edited_${activeFile?.name || 'photo.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSavedSuccess(false);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      artist: '',
      copyright: '',
      description: '',
      userComment: '',
      make: '',
      model: '',
      lens: '',
      software: '',
      dateTimeOriginal: '',
      createDate: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 2-Column Split: Left Column (Presets & Mode) / Right Column (Form Fields) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Photo Preview & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Photo Preview Card */}
          <div className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-3">
            <div className="relative aspect-square max-h-[320px] rounded-xl bg-card-strong border border-subtle overflow-hidden flex items-center justify-center">
              {activeFile?.previewUrl ? (
                <img
                  src={activeFile.previewUrl}
                  alt={activeFile.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs font-mono text-muted">No Image Loaded</span>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-xs font-bold uppercase tracking-wider">
                {activeFile?.type ? activeFile.type.split('/')[1]?.toUpperCase() : 'JPG'}
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-bold text-base text-foreground truncate">
                {activeFile?.name || 'sample_photo.jpg'}
              </h3>
              <p className="text-xs font-mono text-muted">
                Mode: {mode === 'remove' ? 'Fresh Slate (Strip & Overwrite)' : 'Keep Existing & Overwrite'}
              </p>
            </div>
          </div>

          {/* Quick Presets Card */}
          <div className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                1-Click Camera Presets
              </h4>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => applyPreset('canon')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-card-raised hover:bg-card-strong/80 border border-subtle text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-subtle flex items-center justify-center text-muted group-hover:text-brand transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">DSLR: Canon EOS R5</span>
                    <span className="text-[11px] text-muted">24-70mm F2.8L • Adobe Lightroom</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-brand">Apply</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('iphone')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-card-raised hover:bg-card-strong/80 border border-subtle text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-subtle flex items-center justify-center text-muted group-hover:text-brand transition-colors">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Phone: iPhone 15 Pro</span>
                    <span className="text-[11px] text-muted">iOS 17.5.1 • 48MP Main Camera</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-brand">Apply</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('clearAi')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-card-raised hover:bg-card-strong/80 border border-subtle text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-subtle flex items-center justify-center text-muted group-hover:text-brand transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Clean Studio: Sony A7R V</span>
                    <span className="text-[11px] text-muted">Zero AI Manifests • Capture One</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-brand">Apply</span>
              </button>
            </div>
          </div>

          {/* Mode Selection Radio Card matching DeleteFootprints.ai */}
          <div className="bg-white rounded-panel border border-subtle p-5 shadow-subtle space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              What to do with Existing Metadata?
            </h4>

            <div className="space-y-2 text-xs">
              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  mode === 'remove' 
                    ? 'bg-card-strong border-brand/40 shadow-subtle' 
                    : 'bg-card-raised border-subtle hover:bg-card-strong/40'
                }`}
              >
                <input
                  type="radio"
                  name="metadata-mode"
                  checked={mode === 'remove'}
                  onChange={() => setMode('remove')}
                  className="mt-0.5 text-brand focus:ring-brand"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">
                    Remove Existing Metadata (Recommended)
                  </span>
                  <span className="text-muted leading-relaxed block text-[11px]">
                    Clears all original metadata first, then applies only the clean fields you fill in below.
                  </span>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  mode === 'preserve' 
                    ? 'bg-card-strong border-brand/40 shadow-subtle' 
                    : 'bg-card-raised border-subtle hover:bg-card-strong/40'
                }`}
              >
                <input
                  type="radio"
                  name="metadata-mode"
                  checked={mode === 'preserve'}
                  onChange={() => setMode('preserve')}
                  className="mt-0.5 text-brand focus:ring-brand"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">
                    Keep and Add / Overwrite
                  </span>
                  <span className="text-muted leading-relaxed block text-[11px]">
                    Preserves original camera metadata, overwriting only the specific fields you edit below.
                  </span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Controlled Form Tabs & Fields (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-6">
          
          {/* Form Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-card-strong rounded-xl border border-subtle overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-foreground shadow-subtle font-bold'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            
            {/* TAB 1: Creator & Copyright */}
            {activeTab === 'creator' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Artist / Creator Name
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    placeholder="e.g. John Doe / Studio Photography"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={formData.copyright}
                    onChange={(e) => handleInputChange('copyright', e.target.value)}
                    placeholder="e.g. © 2026 Studio All Rights Reserved"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Image Description / Caption
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="e.g. Sunset landscape captured during golden hour over the mountain valley."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    User Comment
                  </label>
                  <input
                    type="text"
                    value={formData.userComment}
                    onChange={(e) => handleInputChange('userComment', e.target.value)}
                    placeholder="e.g. Natural lighting, handheld capture"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Camera & Lens */}
            {activeTab === 'camera' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                      Camera Make
                    </label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      placeholder="e.g. Canon, Nikon, Sony, Apple"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                      Camera Model
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="e.g. EOS R5, Z8, A7 IV, iPhone 15 Pro"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Lens Model
                  </label>
                  <input
                    type="text"
                    value={formData.lens}
                    onChange={(e) => handleInputChange('lens', e.target.value)}
                    placeholder="e.g. RF 24-70mm F2.8L IS USM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Software / Processing Tool
                  </label>
                  <input
                    type="text"
                    value={formData.software}
                    onChange={(e) => handleInputChange('software', e.target.value)}
                    placeholder="e.g. Adobe Photoshop Lightroom Classic"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Date & Time */}
            {activeTab === 'datetime' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs text-muted">ISO 8601 Timestamp Formatting</span>
                  <button
                    type="button"
                    onClick={setDateToNow}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Set to Current Date &amp; Time
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Date &amp; Time Original (Capture Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTimeOriginal}
                    onChange={(e) => handleInputChange('dateTimeOriginal', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Create Date / Digitized Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.createDate}
                    onChange={(e) => handleInputChange('createDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand transition-colors font-mono"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-subtle bg-white hover:bg-card-strong text-xs font-semibold text-muted-strong hover:text-foreground transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted" />
              <span>Reset Fields</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-[14px] font-bold shadow-sm transition-all hover:-translate-y-0.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-brand-soft" />
                  <span>Image Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save &amp; Download Updated Image</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
