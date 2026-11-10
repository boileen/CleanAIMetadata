import React from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import SeoHead from '../components/layout/SeoHead';
import { SEO_CONFIG, getWebApplicationSchema } from '../config/seoConfig';
import { useWorkspace } from '../context/WorkspaceContext';

// Shared Page Components
import FileQueueCard from '../components/shared/FileQueueCard';
import HowItWorksStrip from '../components/shared/HowItWorksStrip';
import FeatureGrid from '../components/shared/FeatureGrid';
import VerificationTable from '../components/shared/VerificationTable';
import FaqAccordion from '../components/shared/FaqAccordion';

// Tool Components
import MetadataPreview from '../components/tools/MetadataPreview';
import CleanedResults from '../components/tools/CleanedResults';

// Shared Components
import UploadDropzone from '../components/shared/UploadDropzone';

function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-5 sm:gap-7 px-2 text-xs text-muted font-medium justify-start -mt-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
          <svg className="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        100% Free
      </span>

      <span className="inline-flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
          <svg className="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        No installation required
      </span>

      <span className="inline-flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-sm">
          <svg className="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        Secure &amp; private
      </span>
    </div>
  );
}

export default function RemoveMetadataPage() {
  const seo = SEO_CONFIG.home;
  const schema = getWebApplicationSchema(seo);
  const { files, activeFile, addFiles, cleanAll, errorMessage } = useWorkspace();

  const hasFiles = files && files.length > 0;
  const allCleaned = hasFiles && files.every((f) => f.status === 'cleaned');
  const uploadedCount = files.filter((f) => f.status === 'uploaded').length;
  const anyProcessing = files.some((f) => f.status === 'uploading' || f.status === 'processing');
  const canClean = uploadedCount > 0 && !anyProcessing;

  return (
    <div className="w-full">
      <SeoHead
        title={seo.exactTitle}
        description={seo.description}
        keywords={seo.keywords}
        canonical={seo.canonical}
        schemaJson={schema}
      />

      {/* Main Page Container matching Unheic width: max-w-[74rem] (1184px) */}
      <div className="max-w-[74rem] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-10">
        {/* Top Header & Workspace Group */}
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2 pb-1">
            <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-tight">
              Strip AI Metadata &amp; <span className="text-brand">EXIF Footprints</span> Instantly
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed">
              Remove EXIF, GPS, and AI tags in your browser. Your photo is never uploaded.
            </p>
          </div>

          {/* Error / limit feedback */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-risk-rose-border bg-risk-rose-bg px-4 py-3 text-xs sm:text-[13px] text-risk-rose-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* EMPTY STATE — dropzone */}
          {!hasFiles && (
            <>
              <UploadDropzone
                onFiles={(fileList) => addFiles(fileList)}
                multiple
                title="Drag photos or AI images here"
                subtitle="JPEG, PNG, WebP, TIFF, or HEIC up to 100MB"
                buttonLabel="Upload"
                inputId="file-upload-input"
              />

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all shadow-sm bg-card-strong border border-subtle text-muted/60 cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove All Metadata</span>
                </button>
              </div>
            </>
          )}

          {/* UPLOADED STATE — queue + metadata inspection */}
          {hasFiles && !allCleaned && (
            <>
              <FileQueueCard />

              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={cleanAll}
                  disabled={!canClean}
                  className={`inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all shadow-sm ${
                    canClean
                      ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer hover:-translate-y-0.5 hover:shadow'
                      : 'bg-card-strong border border-subtle text-muted/60 cursor-not-allowed'
                  }`}
                >
                  {anyProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Remove All Metadata{uploadedCount > 0 ? ` (${uploadedCount})` : ''}</span>
                    </>
                  )}
                </button>
                {anyProcessing && (
                  <p className="text-[11px] font-mono text-muted">Reading and scanning files in your browser…</p>
                )}
              </div>

              {activeFile && activeFile.metadata && (
                <MetadataPreview file={activeFile} />
              )}

              <TrustBadges />
            </>
          )}

          {/* CLEANED STATE — results + downloads */}
          {allCleaned && <CleanedResults />}
        </div>

        {/* 4-Step Process Strip */}
        <HowItWorksStrip />

        {/* 9 Feature Directory Cards */}
        <FeatureGrid />

        {/* Verification Policy Table and Educational Guide */}
        <VerificationTable />

        {/* 10 Expandable FAQ Accordions */}
        <FaqAccordion />
      </div>
    </div>
  );
}
