import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ChevronDown,
  Info,
} from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';
import { useWorkspace } from '../context/WorkspaceContext';

// Tool Components
import ViewFileList from '../components/tools/ViewFileList';
import MetadataPreview from '../components/tools/MetadataPreview';

// Shared Components
import UploadDropzone from '../components/shared/UploadDropzone';

const VIEW_FAQS = [
  {
    question: 'What metadata can I see on this page?',
    answer: 'EXIF (camera, exposure, timestamps), IPTC (credits, digital source type), XMP (software history, AI prompts), C2PA provenance manifests, and GPS coordinates.',
  },
  {
    question: 'Does viewing metadata change my file?',
    answer: 'No. Nothing is written. The file is parsed in browser memory and stays untouched.',
  },
  {
    question: 'How do you detect AI footprints?',
    answer: 'The parser scans raw headers for C2PA JUMBF manifests, IPTC digitalSourceType markers, generator names such as Midjourney or Firefly, and PNG prompt chunks (tEXt, iTXt).',
  },
  {
    question: 'Can I export a report of the metadata?',
    answer: 'Yes. Open a file’s panel and use Copy JSON or CSV. The report is built in your browser and never sent to a server.',
  },
];

export default function ViewMetadataPage() {
  const seo = SEO_CONFIG.viewMetadata;
  const schema = getWebApplicationSchema(seo);
  const {
    files,
    addFiles,
    errorMessage,
    setActiveFileId,
    retryFile,
    maxFiles,
  } = useWorkspace();

  const [openFileId, setOpenFileId] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const hasFiles = files && files.length > 0;
  const openFile = files.find((file) => file.id === openFileId) || null;

  // If the inspected file is cancelled, close the panel with it.
  useEffect(() => {
    if (openFileId && !files.some((file) => file.id === openFileId)) {
      setOpenFileId(null);
    }
  }, [files, openFileId]);

  const handleToggleMetadata = (file) => {
    setActiveFileId(file.id);
    setOpenFileId((prev) => (prev === file.id ? null : file.id));
  };

  const handleRemoved = (id) => {
    if (openFileId === id) setOpenFileId(null);
  };

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={schema}
      />

      {/* Main Container matching Unheic width: max-w-[74rem] (1184px) */}
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-12">

        {/* Top Header Section */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2 pb-1">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            Inspect Photo <span className="text-brand">EXIF &amp; Provenance Tags</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            Read EXIF, IPTC, XMP, and C2PA credentials directly in your browser.
          </p>
        </div>

        {/* Workspace group */}
        <div className="space-y-6">
          {/* Error / limit feedback */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-risk-rose-border bg-risk-rose-bg px-4 py-3 text-xs sm:text-[13px] text-risk-rose-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Persistent dropzone — stays visible after upload */}
          <UploadDropzone
            onFiles={(fileList) => addFiles(fileList)}
            accept="image/jpeg,image/png,image/webp,image/tiff,image/heic"
            multiple
            maxFiles={Math.max(0, (maxFiles ?? 5) - files.length)}
            title="Drag & Drop or Click to Upload"
            subtitle="JPEG, PNG, WebP, TIFF or HEIC"
            limit="Up to 5 images · 100 MB"
            buttonLabel="Choose Image"
            inputId="view-metadata-input"
          />

          {/* Uploaded file list */}
          {hasFiles && (
            <ViewFileList
              openFileId={openFileId}
              onToggleMetadata={handleToggleMetadata}
              onRemoved={handleRemoved}
            />
          )}

          {/* Toggled metadata panel */}
          {openFile && (
            <MetadataPreview
              key={openFile.id}
              file={openFile}
              showExport
              defaultOpenAll
              onClose={() => setOpenFileId(null)}
              onRetry={() => retryFile(openFile.id)}
            />
          )}
        </div>

        {/* BELOW THE FOLD: Educational Info Section */}
        <section className="bg-white rounded-panel border border-subtle p-6 sm:p-10 shadow-subtle space-y-6 text-muted-strong leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              View Image Metadata Info (EXIF, IPTC, XMP, C2PA)
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              For researchers, photographers, and creators.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-[14px] text-muted leading-relaxed pt-2">
            <p>
              Upload an image to read its EXIF, IPTC, and XMP tags. The parser works on the
              binary headers in your browser, so no file bytes cross the network.
            </p>
            <p>
              AI signals are flagged too: signed C2PA manifests from Firefly or DALL·E 3,
              IPTC <span className="font-mono text-foreground">digitalSourceType</span> markers,
              and Stable Diffusion prompts saved in PNG chunks.
            </p>
            <p>
              Click “View Metadata” to expand each section, then copy the report as JSON or
              download it as CSV.
            </p>
            <div className="p-3.5 rounded-xl bg-card-raised border border-subtle text-muted flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                <strong>Read-only:</strong> this page never changes your file. To purge or customise tags, use the
                <Link to="/" className="text-brand font-semibold hover:underline ml-1">Remove Metadata</Link> or
                <Link to="/edit-metadata" className="text-brand font-semibold hover:underline ml-1">Edit Metadata</Link> tools.
              </span>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-4 pt-2 pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>

          <div className="bg-white rounded-panel border border-subtle divide-y divide-subtle shadow-subtle overflow-hidden">
            {VIEW_FAQS.map((faq, idx) => {
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
