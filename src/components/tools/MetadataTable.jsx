import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Download, FileJson } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Tags' },
  { id: 'c2pa', label: 'AI / C2PA' },
  { id: 'exif', label: 'EXIF' },
  { id: 'iptc', label: 'IPTC' },
  { id: 'xmp', label: 'XMP' },
  { id: 'gps', label: 'GPS' },
];

export default function MetadataTable({ activeFile }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Flatten active file metadata into table rows with category tags
  const allRows = useMemo(() => {
    if (!activeFile || !activeFile.metadata) return [];

    const rows = [];
    const meta = activeFile.metadata;

    // 1. C2PA / AI Tags
    if (meta.c2pa) {
      Object.entries(meta.c2pa).forEach(([key, val]) => {
        rows.push({
          category: 'c2pa',
          categoryLabel: 'AI / C2PA',
          key: `C2PA.${key}`,
          value: typeof val === 'object' ? JSON.stringify(val) : String(val),
          isAi: true,
        });
      });
    }

    // 2. EXIF Tags
    if (meta.exif) {
      Object.entries(meta.exif).forEach(([key, val]) => {
        rows.push({
          category: 'exif',
          categoryLabel: 'EXIF',
          key: `Exif.${key}`,
          value: typeof val === 'object' ? JSON.stringify(val) : String(val),
          isAi: false,
        });
      });
    }

    // 3. IPTC Tags
    if (meta.iptc) {
      Object.entries(meta.iptc).forEach(([key, val]) => {
        rows.push({
          category: 'iptc',
          categoryLabel: 'IPTC',
          key: `IPTC.${key}`,
          value: typeof val === 'object' ? JSON.stringify(val) : String(val),
          isAi: key.toLowerCase().includes('source') || String(val).toLowerCase().includes('algorithmic'),
        });
      });
    }

    // 4. XMP Tags
    if (meta.xmp) {
      Object.entries(meta.xmp).forEach(([key, val]) => {
        rows.push({
          category: 'xmp',
          categoryLabel: 'XMP',
          key: `XMP.${key}`,
          value: typeof val === 'object' ? JSON.stringify(val) : String(val),
          isAi: key.toLowerCase().includes('creator') || String(val).toLowerCase().includes('midjourney'),
        });
      });
    }

    // 5. GPS Tags
    if (meta.gps) {
      Object.entries(meta.gps).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          rows.push({
            category: 'gps',
            categoryLabel: 'GPS',
            key: `GPS.${key}`,
            value: String(val),
            isAi: false,
          });
        }
      });
    }

    return rows;
  }, [activeFile]);

  // Filter rows by category and search query
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const matchesCategory = selectedCategory === 'all' || row.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        row.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.value.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allRows, selectedCategory, searchQuery]);

  // Copy single row value
  const handleCopyRow = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Copy full JSON
  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(activeFile?.metadata || {}, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!filteredRows.length) return;
    const header = 'Category,Tag Key,Tag Value\n';
    const csvContent = filteredRows
      .map(r => `"${r.categoryLabel}","${r.key}","${r.value.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeFile?.name || 'metadata'}_inspection.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-panel border border-subtle p-6 shadow-subtle space-y-5">
      
      {/* Category Pills & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-card-strong text-muted hover:text-foreground hover:bg-card-strong/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Export & Copy Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-subtle bg-white hover:bg-card-strong text-xs font-semibold text-muted-strong hover:text-foreground transition-all shadow-subtle"
            title="Copy entire metadata as JSON"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-brand" /> : <FileJson className="w-3.5 h-3.5 text-muted" />}
            <span>{copiedAll ? 'Copied' : 'JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-subtle bg-white hover:bg-card-strong text-xs font-semibold text-muted-strong hover:text-foreground transition-all shadow-subtle"
            title="Download CSV table"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Live Keyword Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search metadata keys, tags, or values..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-muted hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Monospace Inspection Table */}
      <div className="rounded-xl border border-subtle overflow-hidden">
        <div className="max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-card-raised border-b border-subtle text-muted uppercase tracking-wider text-[11px] sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-2.5 px-4 font-bold">Category</th>
                <th className="py-2.5 px-4 font-bold">Tag Key</th>
                <th className="py-2.5 px-4 font-bold">Value</th>
                <th className="py-2.5 px-3 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 text-foreground">
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => {
                  const isCopied = copiedKey === row.key;
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-card-raised/70 transition-colors ${
                        row.isAi ? 'bg-risk-rose-bg/25' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.isAi
                            ? 'bg-risk-rose-bg text-risk-rose-text border border-risk-rose-border'
                            : 'bg-card-strong text-muted border border-subtle'
                        }`}>
                          {row.categoryLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-foreground whitespace-nowrap">
                        {row.key}
                      </td>
                      <td className="py-2.5 px-4 text-muted-strong break-all max-w-[280px]">
                        {row.value}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopyRow(row.key, row.value)}
                          className="p-1 rounded hover:bg-card-strong text-muted hover:text-foreground transition-colors"
                          title="Copy tag value"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-brand" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-muted">
                    {searchQuery
                      ? `No matching metadata tags found for "${searchQuery}".`
                      : 'No embedded metadata tags found in this file.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer Status */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-1 border-t border-subtle/50">
        <span>Showing {filteredRows.length} of {allRows.length} tags</span>
        <span>100% Client-Side In-Memory Inspection</span>
      </div>

    </div>
  );
}
