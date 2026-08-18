/**
 * CET (Configura Extension Technology) is the specifying tool behind CET Designer.
 * JSI ships a manufacturer extension on MyConfigura; dealers and JSI reps specify
 * the catalog there, then share the working files with the project.
 *
 * Native CET files cannot be previewed in a browser — they open in CET Designer
 * (or Revit, for RevLink exports). Do not fake a viewer.
 *
 * What actually moves between a dealer and JSI:
 *   .cmpck  Pack & Go — drawing + referenced CAD. The file dealers send.
 *   .cmdrw  CET Drawing — local working file; still useful if CAD refs aren't needed.
 *   .cmscl  Finish schemes (client standards / price-point palettes)
 *   .cmfav  Favorites (typicals, specials)
 *   .cmphs  Photo Lab series (saved camera setups)
 *   .cmfrl / .cmrf  RevLink furniture layout / families for Revit
 *
 * .cmlock is a live lock while a drawing is open — never accept it as an upload.
 */

const CET_BY_EXT = {
  cmdrw: { kind: 'cet-drawing', type: 'CET Drawing', native: true, label: 'Drawing', opensIn: 'cet' },
  cmpck: { kind: 'cet-pack', type: 'CET Pack & Go', native: true, label: 'Pack & Go', opensIn: 'cet' },
  cmbak: { kind: 'cet-backup', type: 'CET Backup', native: true, label: 'Backup', opensIn: 'cet' },
  cmfav: { kind: 'cet-favorite', type: 'CET Favorites', native: true, label: 'Favorites', opensIn: 'cet' },
  cmscl: { kind: 'cet-scheme', type: 'CET Scheme', native: true, label: 'Finish scheme', opensIn: 'cet' },
  cmpri: { kind: 'cet-info', type: 'CET Project Info', native: true, label: 'Project info', opensIn: 'cet' },
  cmphs: { kind: 'cet-photos', type: 'CET Photo Series', native: true, label: 'Photo series', opensIn: 'cet' },
  cmfrl: { kind: 'cet-revlink', type: 'CET RevLink Layout', native: false, label: 'RevLink', opensIn: 'revit' },
  cmrf: { kind: 'cet-revlink', type: 'CET RevLink Families', native: false, label: 'RevLink families', opensIn: 'revit' },
};

export const CET_UPLOAD_ACCEPT = [
  '.cmdrw', '.cmpck', '.cmbak', '.cmfav', '.cmscl', '.cmpri', '.cmphs',
  '.cmfrl', '.cmrf',
  '.dwg', '.dxf',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.png', '.jpg', '.jpeg',
].join(',');

export const getFileExtension = (fileName = '') => {
  const match = String(fileName).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
};

export const classifyProjectFile = (fileName, mimeType = '') => {
  const ext = getFileExtension(fileName);
  if (CET_BY_EXT[ext]) return { ...CET_BY_EXT[ext], extension: ext, isCet: true };

  if (ext === 'cmlock') {
    return { kind: 'lock', type: 'CET lock', native: false, label: 'Lock file', extension: ext, isCet: false, skip: true };
  }

  const mime = String(mimeType || '').toLowerCase();
  if (ext === 'pdf' || mime.includes('pdf')) return { kind: 'pdf', type: 'PDF', native: false, label: 'PDF', extension: ext, isCet: false };
  if (ext === 'dwg' || ext === 'dxf') return { kind: 'cad', type: ext.toUpperCase(), native: false, label: 'CAD from CET', extension: ext, isCet: false };
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) || mime.startsWith('image/')) {
    return { kind: 'image', type: 'Image', native: false, label: 'Image', extension: ext, isCet: false };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { kind: 'spreadsheet', type: 'Spreadsheet', native: false, label: 'BOM / worksheet', extension: ext, isCet: false };
  if (['doc', 'docx'].includes(ext)) return { kind: 'document', type: 'Document', native: false, label: 'Document', extension: ext, isCet: false };
  return { kind: 'document', type: 'Document', native: false, label: 'Document', extension: ext, isCet: false };
};

export const isCetNative = (doc) => {
  if (!doc) return false;
  if (doc.kind && String(doc.kind).startsWith('cet-')) return true;
  return classifyProjectFile(doc.fileName, doc.mimeType).isCet;
};

export const canPreviewProjectFile = (doc) => {
  const classified = classifyProjectFile(doc?.fileName, doc?.mimeType);
  return classified.kind === 'pdf' || classified.kind === 'image';
};

export const describeCetDownload = (doc) => {
  const classified = classifyProjectFile(doc?.fileName, doc?.mimeType);
  if (classified.opensIn === 'revit' || classified.kind === 'cet-revlink') return 'Download for Revit';
  if (classified.isCet) return 'Download to open in CET Designer';
  return 'Download';
};

export const describeDocumentSource = (doc) => {
  if (!doc) return '';
  const role = doc.uploadedByRole === 'dealer' ? 'Dealer' : doc.uploadedByRole === 'rep' ? 'JSI' : '';
  return [doc.uploadedBy, doc.company, role].filter(Boolean).join(' · ');
};

export const partitionProjectDocuments = (documents = []) => {
  const cet = [];
  const other = [];
  (documents || []).forEach((doc) => {
    if (isCetNative(doc)) cet.push(doc);
    else other.push(doc);
  });
  return { cet, other };
};

export const formatFileSize = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
  return `${(n / (1024 * 1024)).toFixed(1)}MB`;
};

export const isRejectedUpload = (fileName) => classifyProjectFile(fileName).skip === true;

let uploadSeq = 0;

export const buildUploadedDocument = (file, extras = {}, index = 0) => {
  if (!file?.name || isRejectedUpload(file.name)) return null;
  const classified = classifyProjectFile(file.name, file.type);
  if (classified.skip) return null;
  uploadSeq += 1;
  const { uploadedBy, uploadedByRole, company, attachedToNotes } = extras;
  return {
    id: `doc_${Date.now()}_${uploadSeq}_${index}_${file.name}`,
    fileName: file.name,
    type: classified.type,
    kind: classified.kind,
    size: formatFileSize(file.size),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    uploadedBy: uploadedBy || '',
    uploadedByRole: uploadedByRole || 'user',
    company: company || '',
    attachedToNotes: attachedToNotes === true,
  };
};

export const buildUploadedDocuments = (files, extras = {}) => (
  Array.from(files || []).map((file, index) => buildUploadedDocument(file, extras, index)).filter(Boolean)
);

const usableUrl = (doc, blobUrl) => {
  if (blobUrl) return blobUrl;
  const url = doc?.url;
  if (url && url !== '#') return url;
  return '';
};

export const downloadProjectDocument = (doc, blobUrl) => {
  if (typeof document === 'undefined' || !doc) return false;
  const href = usableUrl(doc, blobUrl);
  const a = document.createElement('a');
  a.rel = 'noopener';
  a.download = doc.fileName || 'download';
  if (href) {
    a.href = href;
  } else {
    const objectUrl = URL.createObjectURL(new Blob([], { type: 'application/octet-stream' }));
    a.href = objectUrl;
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
};

export const previewProjectDocument = (doc, blobUrl) => {
  if (typeof window === 'undefined' || !doc) return false;
  const href = usableUrl(doc, blobUrl);
  if (!href) return false;
  window.open(href, '_blank', 'noopener,noreferrer');
  return true;
};

export const describeDocumentsHub = (documents = []) => {
  const docs = documents || [];
  if (!docs.length) return 'Drop in CET drawings, plans, and PDFs';
  const cet = docs.filter(isCetNative);
  const packs = cet.filter(d => (d.kind || classifyProjectFile(d.fileName).kind) === 'cet-pack').length;
  const drawings = cet.filter(d => (d.kind || classifyProjectFile(d.fileName).kind) === 'cet-drawing').length;
  const parts = [];
  if (drawings) parts.push(`${drawings} CET drawing${drawings === 1 ? '' : 's'}`);
  if (packs) parts.push(`${packs} Pack & Go`);
  const otherCet = cet.length - drawings - packs;
  if (!drawings && !packs && cet.length) parts.push(`${cet.length} CET file${cet.length === 1 ? '' : 's'}`);
  else if (otherCet > 0) parts.push(`${otherCet} more CET`);
  const other = docs.length - cet.length;
  if (other) parts.push(`${other} other`);
  return parts.join(' · ');
};

