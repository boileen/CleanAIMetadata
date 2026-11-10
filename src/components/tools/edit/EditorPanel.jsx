import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  METADATA_TABS,
  isFieldSupported,
} from '../../../config/metadataSchema';
import FieldControl from './FieldControl';

export default function EditorPanel({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  groups,
  groupKeys,
  toggleGroup,
  expandAll,
  collapseAll,
  values,
  updateValue,
  fileInfo,
  filledByTab,
  filledCount,
  status,
  progress,
  progressLabel,
  onProcess,
  onReset,
  notice,
}) {
  const processing = status === 'processing';
  const activeMeta = METADATA_TABS.find((tab) => tab.id === activeTab);

  return (
    <section className="rounded-panel border border-subtle bg-white shadow-subtle">
      <div className="space-y-3 border-b border-subtle/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-bold text-foreground">Metadata fields</h2>
              <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand">
                {filledCount} selected
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Edit only what you need. Empty fields are not written.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => expandAll(groupKeys)}
              className="rounded-lg border border-subtle bg-card-raised px-2.5 py-1.5 text-[10px] font-semibold text-muted-strong transition-colors hover:bg-card-strong"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-lg border border-subtle bg-card-raised px-2.5 py-1.5 text-[10px] font-semibold text-muted-strong transition-colors hover:bg-card-strong"
            >
              Collapse
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search 60+ fields: lens, copyright, GPS, credit…"
            className="w-full rounded-xl border border-subtle bg-card-raised py-2.5 pl-9 pr-9 text-[12px] text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-card-strong hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-subtle bg-card-strong/70 p-1">
          {METADATA_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  active
                    ? 'bg-white text-foreground shadow-subtle'
                    : 'text-muted hover:text-foreground'
                }`}
                title={tab.description}
              >
                {tab.label}
                <span
                  className={`rounded px-1 py-0.5 font-mono text-[9px] ${
                    active ? 'bg-brand-soft text-brand' : 'bg-white/60 text-muted'
                  }`}
                >
                  {filledByTab[tab.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {activeMeta && !search && (
          <p className="text-[10px] text-muted">{activeMeta.description}</p>
        )}
      </div>

      {notice && (
        <div className="mx-4 mt-4 rounded-xl border border-brand/15 bg-brand-soft/50 px-3 py-2 text-[11px] font-medium text-brand sm:mx-5">
          {notice}
        </div>
      )}

      <div className="divide-y divide-subtle/60 px-4 sm:px-5">
        {groups.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No matching fields</p>
            <p className="mt-1 text-[11px] text-muted">
              Try a different search, or switch to another metadata tab.
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.key} className="py-3">
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-card-raised/70"
            >
              <span className="flex items-center gap-2">
                {group.expanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted" />
                )}
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-strong">
                  {group.name}
                </span>
              </span>
              <span className="font-mono text-[10px] text-muted">
                {group.filled}/{group.fields.length}
              </span>
            </button>

            {group.expanded && (
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <FieldControl
                    key={`${field.tab}-${field.id}`}
                    field={field}
                    value={values[field.id]}
                    onChange={(value) => updateValue(field.id, value)}
                    disabled={!isFieldSupported(field, fileInfo?.format)}
                    format={fileInfo?.format}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-subtle/70 p-4 sm:p-5">
        {processing && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-[10px] font-medium text-muted">
              <span className="truncate">{progressLabel || 'Working…'}</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-card-strong">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onReset}
            disabled={processing}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-subtle bg-white px-4 py-2.5 text-xs font-semibold text-muted-strong transition-all hover:bg-card-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to original
          </button>

          <button
            type="button"
            onClick={onProcess}
            disabled={processing || !fileInfo?.supported}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Writing &amp; verifying…
              </>
            ) : (
              <>
                <FileCheck2 className="h-4 w-4" />
                Write metadata &amp; verify
              </>
            )}
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted sm:text-right">
          The output is re-parsed in your browser before the download button appears.
        </p>
      </div>
    </section>
  );
}
