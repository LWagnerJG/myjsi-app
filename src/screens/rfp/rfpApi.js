async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function fetchRfpStatus() {
  const res = await fetch('/api/rfp/status', {
    headers: { 'content-type': 'application/json' },
  });
  return readJson(res);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.slice(result.indexOf(',') + 1) : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/** Client-side size check before upload (server also enforces 4 MB / file). */
export const CLIENT_MAX_FILE_BYTES = 4 * 1024 * 1024;
export const CLIENT_MAX_FILES = 5;

export async function extractRfpPdfs(files) {
  const list = Array.from(files || []);
  if (!list.length) throw new Error('Select at least one PDF');
  if (list.length > CLIENT_MAX_FILES) throw new Error(`Maximum ${CLIENT_MAX_FILES} PDFs`);

  const payloadFiles = [];
  for (const file of list) {
    if (file.size > CLIENT_MAX_FILE_BYTES) {
      throw new Error(`${file.name} exceeds 4 MB. Compress the PDF or split attachments.`);
    }
    if (file.type && file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      throw new Error(`${file.name} is not a PDF`);
    }
    const dataBase64 = await fileToBase64(file);
    payloadFiles.push({
      name: file.name,
      mimeType: file.type || 'application/pdf',
      dataBase64,
    });
  }

  const res = await fetch('/api/rfp/extract', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ files: payloadFiles }),
  });
  return readJson(res);
}

export async function analyzeRfpPages({ pages, emptyPages, fileName }) {
  const slimPages = (pages || []).map((p) => ({
    pageNumber: p.pageNumber,
    text: p.text || '',
    hasExtractableText: p.hasExtractableText,
    fileName: p.fileName,
  }));

  const res = await fetch('/api/rfp/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pages: slimPages, emptyPages, fileName }),
  });
  return readJson(res);
}
