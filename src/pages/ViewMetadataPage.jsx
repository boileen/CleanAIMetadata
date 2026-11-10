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
    answer: 'You can inspect all embedded technical metadata containers including EXIF (camera make, model, exposure, timestamps), IPTC (creator credits, digital source type), XMP (software history, AI prompt strings), C2PA (cryptographic provenance manifests), and GPS decimal coordinates.',
  },
  {
    question: 'Does viewing metadata change my file?',
    answer: 'No. Viewing metadata is a strictly read-only operation. Your image bytes are parsed in browser memory and no modifications or overwrites are written to your file on this page.',
  },
  {
    question: 'How do you detect AI footprints?',
    answer: 'Our in-browser parser scans raw binary headers for C2PA JUMBF manifests, IPTC digitalSourceType markers (such as trainedAlgorithmicMedia), software creator tools (such as Midjourney, DALL-E, Firefly), and PNG prompt chunks (tEXt, iTXt).',
  },
  {
    question: 'Can I export a report of the metadata?',
    answer: 'Yes. Open any file’s metadata panel and use Copy JSON or CSV. The full section-by-section breakdown is generated in your browser — no report is ever sent to a server.',
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
        <div className="text-center space-y-2.5 max-w-3xl mx-auto pt-2 pb-1">
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
            View Image Metadata and Find out <span className="text-brand">GPS, AI &amp; Other Footprints</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed max-w-xl mx-auto">
            Inspect embedded EXIF, IPTC, XMP, and C2PA Content Credentials 100% locally in your browser. Zero server uploads.
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
            title="Drag & Drop or Click to Upload"
            subtitle="Support for JPEG, PNG, WebP, TIFF, HEIC (Max: 100MB)"
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
              Deep forensic triage for researchers, photographers, and creators.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-[14px] text-muted leading-relaxed pt-2">
            <p>
              Upload an image to inspect all embedded metadata including EXIF, IPTC, and XMP.
              Our parser reads the binary headers directly in your browser without transmitting any file bytes over the network.
            </p>
            <p>
              We also highlight possible AI-related signals when present, such as signed C2PA manifests from Adobe Firefly or DALL·E 3,
              IPTC <span className="font-mono text-foreground">digitalSourceType</span> markers, and Stable Diffusion prompt strings saved inside PNG chunks.
            </p>
            <p>
              Click “View Metadata” to see a detailed, easy-to-read breakdown. Expand each section to inspect file information and
              hidden metadata, then copy the full report as JSON or download it as a CSV spreadsheet.
            </p>
            <div className="p-3.5 rounded-xl bg-card-raised border border-subtle text-muted flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                <strong>Read-Only Guarantee:</strong> No changes are made to your file on this page. If you wish to purge or customize tags, use the
                <Link to="/" className="text-brand font-semibold hover:underline ml-1">Remove Metadata</Link> or
                <Link to="/edit-metadata" className="text-brand font-semibold hover:underline ml-1">Edit Metadata</Link> tools.
              </span>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-6 pt-2 pb-6">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-[14px] text-muted">
              Common questions about inspecting image metadata and AI credentials.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {VIEW_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-panel border border-subtle overflow-hidden shadow-subtle transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-4 sm:py-5 px-6 flex items-center justify-between gap-4 text-left hover:bg-card-raised/60 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {faq.question}
                    </span>
                    <div className={`w-7 h-7 rounded-lg bg-card-strong border border-subtle flex items-center justify-center shrink-0 text-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-[14px] text-muted leading-relaxed border-t border-subtle/50 bg-card-raised/30 animate-fadeIn">
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
