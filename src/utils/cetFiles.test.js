import { describe, it, expect } from 'vitest';
import {
  classifyProjectFile,
  isCetNative,
  describeDocumentsHub,
  buildUploadedDocument,
  canPreviewProjectFile,
  describeCetDownload,
  describeDocumentSource,
  partitionProjectDocuments,
} from './cetFiles.js';

describe('CET file classification', () => {
  it('recognizes native CET drawings and Pack & Go packages', () => {
    expect(classifyProjectFile('Lobby_Refresh.cmdrw')).toMatchObject({ kind: 'cet-drawing', isCet: true, native: true });
    expect(classifyProjectFile('Lobby_Refresh.cmpck')).toMatchObject({ kind: 'cet-pack', type: 'CET Pack & Go', isCet: true });
    expect(classifyProjectFile('Lobby_Refresh.cmbak')).toMatchObject({ kind: 'cet-backup', isCet: true });
    expect(classifyProjectFile('Lobby_Refresh.cmfrl')).toMatchObject({ kind: 'cet-revlink', isCet: true, native: false });
  });

  it('summarizes the Project Hub documents row around CET work', () => {
    expect(describeDocumentsHub([])).toBe('Drop in CET drawings, plans, and PDFs');
    expect(describeDocumentsHub([
      { fileName: 'XYZ_Lobby.cmpck', kind: 'cet-pack' },
      { fileName: 'XYZ_Lobby.cmdrw', kind: 'cet-drawing' },
      { fileName: 'Render.pdf' },
    ])).toBe('1 CET drawing · 1 Pack & Go · 1 other');
  });

  it('tags uploaded File objects with CET kind metadata', () => {
    const doc = buildUploadedDocument({ name: 'OfficeWorks_HQ.cmpck', type: '', size: 2 * 1024 * 1024 }, { uploadedBy: 'Lisa Chen', uploadedByRole: 'dealer', company: 'OfficeWorks' });
    expect(isCetNative(doc)).toBe(true);
    expect(doc.type).toBe('CET Pack & Go');
    expect(doc.uploadedByRole).toBe('dealer');
    expect(doc.size).toBe('2.0MB');
  });

  it('does not offer an in-browser preview for native CET or CAD', () => {
    expect(canPreviewProjectFile({ fileName: 'Lobby.cmpck' })).toBe(false);
    expect(canPreviewProjectFile({ fileName: 'Lobby.dwg' })).toBe(false);
    expect(canPreviewProjectFile({ fileName: 'Lobby_PhotoLab.pdf' })).toBe(true);
    expect(describeCetDownload({ fileName: 'Lobby.cmpck' })).toBe('Download to open in CET Designer');
    expect(describeCetDownload({ fileName: 'Lobby.cmfrl' })).toBe('Download for Revit');
  });

  it('keeps CET work ahead of PDF/CAD exports and tags dealer vs JSI source', () => {
    const { cet, other } = partitionProjectDocuments([
      { fileName: 'Lobby_PhotoLab.pdf' },
      { fileName: 'XYZ_Lobby.cmpck', kind: 'cet-pack', uploadedBy: 'Sarah Palmer', uploadedByRole: 'dealer', company: 'Business Furniture' },
    ]);
    expect(cet).toHaveLength(1);
    expect(other).toHaveLength(1);
    expect(describeDocumentSource(cet[0])).toBe('Sarah Palmer · Business Furniture · Dealer');
  });
});
