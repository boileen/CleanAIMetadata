import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';
import useMetadataEditor from '../hooks/useMetadataEditor';
import { ACCEPTED_IMAGE_TYPES } from '../components/tools/edit/EditDropzone';
import UploadDropzone from '../components/shared/UploadDropzone';
import EditorSidebar from '../components/tools/edit/EditorSidebar';
import EditorPanel from '../components/tools/edit/EditorPanel';
import EditorResult from '../components/tools/edit/EditorResult';
import UnsupportedNotice from '../components/tools/edit/UnsupportedNotice';

const EDIT_STEPS = [
  {
    step: '01',
    title: 'Upload one photo',
    desc: 'A JPEG, PNG or WebP up to 100 MB. Nothing leaves your browser.',
  },
  {
    step: '02',
    title: 'Pick a write mode',
    desc: 'Wipe every tag first, or keep the existing ones and overwrite.',
  },
  {
    step: '03',
    title: 'Edit the fields',
    desc: 'EXIF, IPTC and XMP tabs, 60+ fields, and camera presets.',
  },
  {
    step: '04',
    title: 'Write and verify',
    desc: 'The output is read back and compared before you download.',
  },
  {
    step: '05',
    title: 'Download losslessly',
    desc: 'Pixels and the ICC colour profile stay as they were.',
  },
];

const MODE_COMPARISON = [
  {
    feature: 'Existing standard EXIF / IPTC / XMP',
    removeMode: 'Removed first, then rebuilt from your fields',
    preserveMode: 'Rebuilt from the prefilled fields shown in the editor',
  },
  {
    feature: 'C2PA & AI manifests',
    removeMode: 'Purged from the output',
    preserveMode: 'May remain outside the replaced carriers',
  },
  {
    feature: 'GPS location',
    removeMode: 'Gone unless you fill the GPS fields',
    preserveMode: 'Prefilled; clear the fields to remove it',
  },
  {
    feature: 'ICC colour profile',
    removeMode: 'Preserved',
    preserveMode: 'Preserved',
  },
  {
    feature: 'Proprietary maker notes',
    removeMode: 'Dropped',
    preserveMode: 'Dropped (standard tags only)',
  },
  {
    feature: 'Image pixels',
    removeMode: 'Untouched / lossless',
    preserveMode: 'Untouched / lossless',
  },
  {
    feature: 'Best used for',
    removeMode: 'Publishing without AI flags or hidden metadata',
    preserveMode: 'Updating attribution, camera, copyright or dates',
  },
];

const FIELD_DICTIONARY = [
  {
    field: 'Camera Make & Model',
    container: 'EXIF (0th IFD)',
    purpose: 'The camera body, such as Canon EOS R5 or Sony A7 IV.',
  },
  {
    field: 'Lens Model',
    container: 'EXIF (Exif IFD)',
    purpose: 'The lens used, such as RF 24-70mm F2.8L.',
  },
  {
    field: 'Software',
    container: 'EXIF / XMP',
    purpose: 'The app that processed the file, such as Lightroom Classic.',
  },
  {
    field: 'Artist / Creator',
    container: 'EXIF / IPTC / XMP',
    purpose: 'The photographer or creator name used for attribution.',
  },
  {
    field: 'Copyright Notice',
    container: 'EXIF / IPTC / XMP',
    purpose: 'A copyright statement reserving your rights.',
  },
  {
    field: 'DateTimeOriginal',
    container: 'EXIF (Exif IFD)',
    purpose: 'When the shutter fired, in YYYY:MM:DD HH:MM:SS format.',
  },
  {
    field: 'GPS Latitude & Longitude',
    container: 'EXIF GPS IFD',
    purpose: 'Coordinates stored as degrees, minutes and seconds.',
  },
  {
    field: 'Keywords',
    container: 'IPTC / XMP',
    purpose: 'Terms used by photo libraries and search engines.',
  },
];

const EDIT_FAQS = [
  {
    question: 'Can I edit metadata on an iPhone HEIC photo?',
    answer:
      'Not yet. HEIC, TIFF and AVIF show an unsupported notice instead of being silently converted. Open a JPEG, PNG or WebP to write tags.',
  },
  {
    question: 'Why are fields already filled when I choose remove mode?',
    answer:
      'The editor prefills what it found so you can review it. Remove mode deletes every carrier first, then writes only the fields that still have a value. Use “Clear fields” for an empty start.',
  },
  {
    question: 'Can I edit more than one photo at a time?',
    answer:
      'No. One photo at a time keeps the read-back check and mode disclosure accurate. For batches of up to 5 files, use the Remove Metadata tool.',
  },
  {
    question: 'Does editing remove AI labels or C2PA provenance?',
    answer:
      'In remove mode, yes. All carriers go first, including C2PA, then only your chosen fields are written. Keep & overwrite replaces EXIF, IPTC and XMP, so C2PA data stored elsewhere may remain.',
  },
  {
    question: 'What output format will I get?',
    answer:
      'The same format you uploaded. Pixels are copied through without re-encoding and the ICC colour profile is preserved.',
  },
  {
    question: 'How does the verification step work?',
    answer:
      'The new file is parsed again in your browser. Each non-empty field is compared with the value you asked for, and any mismatch is shown before download.',
  },
  {
    question: 'What happens to proprietary maker notes?',
    answer:
      'They are dropped. The editor rebuilds only standard EXIF, IPTC and XMP tags from the values shown, in both modes.',
  },
  {
    question: 'Does editing change the picture or its visual quality?',
    answer:
      'No. Image data is never decoded or re-encoded. Only the metadata containers are rebuilt.',
  },
];

function ReadingCard({ progress, label }) {
  return (
    <div className="rounded-panel border border-subtle bg-white p-5 shadow-subtle sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Loader2 className="h-5 w-5 animate-spin" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">Reading your photo…</p>
          <p className="text-[11px] text-muted">{label || 'Inspecting format and metadata'}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-card-strong">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${Math.max(4, Math.min(100, progress || 0))}%` }}
        />
      </div>
    </div>
  );
}

export default function EditMetadataPage() {
  const seo = SEO_CONFIG.editMetadata;
  const schema = getWebApplicationSchema(seo);
  const editor = useMetadataEditor();
  const fileInputRef = useRef(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const browse = () => fileInputRef.current?.click();

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) editor.selectFile(file);
  };

  useEffect(() => {
    if (editor.status !== 'done') return;
    const target = document.getElementById('editor-result');
    if (!target) return;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [editor.status]);

  const showEditor = Boolean(editor.entry);
  const showReading = editor.status === 'reading' && !editor.entry;
  const showResult = Boolean(
    editor.entry &&
      (editor.status === 'processing' ||
        editor.status === 'done' ||
        editor.status === 'error'),
  );

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
        <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2 pb-1">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            Edit Photo <span className="text-brand">EXIF &amp; IPTC Tags</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            Add or overwrite metadata in JPEG, PNG, and WebP files without re-encoding pixels.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
          className="hidden"
        />

        {!showEditor && !showReading && (
          <UploadDropzone
            onFiles={handleFiles}
            error={editor.error}
            inputId="edit-metadata-input"
          />
        )}

        {showReading && (
          <ReadingCard progress={editor.progress} label={editor.progressLabel} />
        )}

        {showEditor && !editor.isSupported && (
          <UnsupportedNotice
            previewUrl={editor.previewUrl}
            fileInfo={editor.fileInfo}
            onBrowse={browse}
            onResetAll={editor.resetAll}
          />
        )}

        {showEditor && editor.isSupported && (
          <div id="metadata-editor" className="grid grid-cols-1 gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
            <EditorSidebar
              previewUrl={editor.previewUrl}
              fileInfo={editor.fileInfo}
              mode={editor.mode}
              setMode={editor.setMode}
              onBrowse={browse}
              values={editor.values}
              applyPreset={editor.applyPreset}
              filledByTab={editor.filledByTab}
              filledCount={editor.filledCount}
              onClearValues={editor.clearValues}
            />

            <EditorPanel
              activeTab={editor.activeTab}
              setActiveTab={editor.setActiveTab}
              search={editor.search}
              setSearch={editor.setSearch}
              groups={editor.groups}
              groupKeys={editor.groupKeys}
              toggleGroup={editor.toggleGroup}
              expandAll={editor.expandAll}
              collapseAll={editor.collapseAll}
              values={editor.values}
              updateValue={editor.updateValue}
              fileInfo={editor.fileInfo}
              filledByTab={editor.filledByTab}
              filledCount={editor.filledCount}
              status={editor.status}
              progress={editor.progress}
              progressLabel={editor.progressLabel}
              onProcess={editor.process}
              onReset={editor.resetValues}
              notice={editor.notice}
            />
          </div>
        )}

        {showResult && (
          <EditorResult
            status={editor.status}
            result={editor.result}
            verification={editor.verification}
            error={editor.error}
            onDownload={editor.download}
            onProcess={editor.process}
            onResetAll={editor.resetAll}
          />
        )}

        <section className="space-y-4 pt-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How editing works
          </h2>

          <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-subtle">
              <div className="space-y-1 md:px-4 first:px-0 pt-3 md:pt-0 first:pt-0">
                <span className="font-mono text-xl sm:text-2xl font-bold text-brand leading-none">1</span>
                <h3 className="text-sm font-semibold text-foreground">Open and inspect</h3>
                <p className="text-xs text-muted leading-relaxed">Reads EXIF, IPTC, and XMP segments in browser memory.</p>
              </div>
              <div className="space-y-1 md:px-4 pt-3 md:pt-0">
                <span className="font-mono text-xl sm:text-2xl font-bold text-brand leading-none">2</span>
                <h3 className="text-sm font-semibold text-foreground">Edit or overwrite</h3>
                <p className="text-xs text-muted leading-relaxed">Fill camera, copyright, or GPS values without touching pixel data.</p>
              </div>
              <div className="space-y-1 md:px-4 pt-3 md:pt-0">
                <span className="font-mono text-xl sm:text-2xl font-bold text-brand leading-none">3</span>
                <h3 className="text-sm font-semibold text-foreground">Write and verify</h3>
                <p className="text-xs text-muted leading-relaxed">Generates clean file headers and re-reads the output to confirm tags.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Remove or keep: which mode to pick?
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-card-raised border-b border-subtle text-foreground text-xs font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Signal</th>
                  <th className="py-2.5 px-4">Remove, then write</th>
                  <th className="py-2.5 px-4">Keep &amp; overwrite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle text-muted-strong">
                {MODE_COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-card-raised/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-foreground">{row.feature}</td>
                    <td className="py-2.5 px-4 text-brand font-medium">
                      {row.removeMode}
                    </td>
                    <td className="py-2.5 px-4 text-muted">{row.preserveMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Supported metadata fields
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-card-raised border-b border-subtle text-foreground text-xs font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Field</th>
                  <th className="py-2.5 px-4">Container</th>
                  <th className="py-2.5 px-4">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle text-muted-strong">
                {FIELD_DICTIONARY.map((field) => (
                  <tr key={field.field} className="hover:bg-card-raised/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-foreground whitespace-nowrap">
                      {field.field}
                    </td>
                    <td className="py-2.5 px-4 text-muted text-xs">
                      {field.container}
                    </td>
                    <td className="py-2.5 px-4 text-muted leading-relaxed">{field.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 pt-2 pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>

          <div className="bg-white rounded-panel border border-subtle divide-y divide-subtle shadow-subtle overflow-hidden">
            {EDIT_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
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
