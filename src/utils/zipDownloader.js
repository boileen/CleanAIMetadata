/**
 * Batch ZIP packaging. jszip is imported dynamically so it only loads when the
 * user actually requests a ZIP (keeps the initial bundle small).
 */

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a tick before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function outputName(file) {
  if (!file.lossless && file.format && file.format !== 'png') {
    const base = file.name.replace(/\.[^.]+$/, '');
    return `${base}.png`;
  }
  return file.name;
}

/**
 * Package all cleaned files into a single .zip download.
 * @param {Array<{name:string, cleanedBlob:Blob, lossless?:boolean, format?:string}>} files
 */
export async function downloadZip(files) {
  const cleaned = (files || []).filter((f) => f.cleanedBlob);
  if (!cleaned.length) return;

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  const used = new Set();
  for (const file of cleaned) {
    let name = outputName(file);
    if (used.has(name)) {
      const dot = name.lastIndexOf('.');
      const base = dot > -1 ? name.slice(0, dot) : name;
      const ext = dot > -1 ? name.slice(dot) : '';
      let i = 2;
      while (used.has(`${base}-${i}${ext}`)) i += 1;
      name = `${base}-${i}${ext}`;
    }
    used.add(name);
    zip.file(name, file.cleanedBlob);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, 'aimetadataeraser-cleaned.zip');
}

export { triggerDownload };
