import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { PrimaryButton, SecondaryButton } from '../../components/common/JSIButtons.jsx';
import { X, ImageIcon, Plus, Tag } from 'lucide-react';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { CITY_OPTIONS } from '../../constants/locations.js';
import { JSI_SERIES } from '../../data/jsiSeries.js';
import { hapticSuccess } from '../../utils/haptics.js';

const SUGGESTED_TAGS = [
  'installation', 'workspace', 'lounge', 'conference', 'detail',
  'mood', 'bench', 'desk', 'seating', 'casegoods', 'healthcare',
  'education', 'lobby', 'open-plan', 'private-office',
];

/**
 * Modal for uploading one or more images to the shared library.
 * Collects title, location, series, and free-form tags.
 */
export const UploadToLibraryModal = ({ show, onClose, theme, onUpload }) => {
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]); // [{file, url}]
  const [location, setLocation] = useState('');
  const [series, setSeries] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const fileInputRef = useRef(null);

  // Cleanup object URLs when modal closes / unmounts
  useEffect(() => {
    if (!show && files.length) {
      files.forEach(o => o.url && URL.revokeObjectURL(o.url));
    }
    return () => files.forEach(o => o.url && URL.revokeObjectURL(o.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const canSubmit = useMemo(
    () => files.length > 0 && title.trim().length > 0,
    [files, title],
  );

  const reset = () => {
    setTitle('');
    setFiles(prev => { prev.forEach(o => o.url && URL.revokeObjectURL(o.url)); return []; });
    setLocation('');
    setSeries('');
    setTagInput('');
    setTags([]);
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const next = Array.from(e.target.files).map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setFiles(prev => [...prev, ...next]);
  };

  const removeImage = (idx) => {
    setFiles(prev => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  const addTag = (t) => {
    const trimmed = t.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    hapticSuccess();
    const now = Date.now();
    // Build one asset per uploaded image (or a single asset with multiple images if desired)
    const assets = files.map((f, i) => ({
      id: `upload-${now}-${i}`,
      title: files.length === 1 ? title.trim() : `${title.trim()} (${i + 1})`,
      src: f.url,
      alt: title.trim(),
      source: 'upload',
      products: [],
      series: series || '',
      finish: '',
      tags: [...tags],
      location: location || '',
      createdAt: new Date().toISOString(),
      photographer: 'You',
    }));
    onUpload?.(assets);
    reset();
    onClose?.();
  };

  if (!show) return null;

  const inputStyle = {
    background: theme.colors.subtle,
    color: theme.colors.textPrimary,
  };

  const labelStyle = {
    color: theme.colors.textSecondary,
  };

  const suggestedFiltered = SUGGESTED_TAGS.filter(t => !tags.includes(t));

  return (
    <Modal show={show} onClose={onClose} title="Upload to Library" theme={theme} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">

        {/* ── Image upload area ── */}
        {files.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {files.map((o, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={o.url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {/* Add-more tile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed transition-colors"
              style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
            >
              <Plus className="w-5 h-5" />
              <span className="text-[0.6875rem]">Add</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border-2 border-dashed transition-colors"
            style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary, background: theme.colors.subtle }}
          >
            <ImageIcon className="w-8 h-8 opacity-40" />
            <span className="text-sm font-medium">Tap to select images</span>
            <span className="text-[0.6875rem] opacity-60">JPG, PNG, HEIC</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* ── Title ── */}
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-wider mb-1" style={labelStyle}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Vision Casegoods Install"
            className="w-full h-10 px-4 rounded-xl outline-none text-sm"
            style={inputStyle}
          />
        </div>

        {/* ── Location ── */}
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-wider mb-1" style={labelStyle}>
            Location
          </label>
          <AutoCompleteCombobox
            options={CITY_OPTIONS}
            value={location}
            onChange={setLocation}
            onSelect={setLocation}
            placeholder="Select or type a city..."
            theme={theme}
            compact
          />
        </div>

        {/* ── Series ── */}
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-wider mb-1" style={labelStyle}>
            Series
          </label>
          <AutoCompleteCombobox
            options={JSI_SERIES}
            value={series}
            onChange={setSeries}
            onSelect={setSeries}
            placeholder="Select a JSI series..."
            theme={theme}
            compact
          />
        </div>

        {/* ── Tags ── */}
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-wider mb-1" style={labelStyle}>
            Tags
          </label>

          {/* Selected tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: theme.colors.accent + '18', color: theme.colors.accent }}
                >
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="ml-0.5 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag text input */}
          <div className="flex items-center gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
              className="flex-1 h-9 px-3 rounded-lg outline-none text-xs"
              style={inputStyle}
            />
            {tagInput.trim() && (
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ background: theme.colors.accent, color: theme.colors.accentText }}
              >
                <Tag className="w-3 h-3" /> Add
              </button>
            )}
          </div>

          {/* Suggested tags */}
          {suggestedFiltered.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestedFiltered.slice(0, 8).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="px-2.5 py-1 rounded-full text-[0.6875rem] transition-colors"
                  style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}
                >
                  + {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <SecondaryButton
            type="button"
            onClick={() => { reset(); onClose?.(); }}
            theme={theme}
            className="flex-1 h-11 !py-0 px-5 text-[0.8125rem]"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={!canSubmit}
            theme={theme}
            className="flex-1 h-11 !py-0 px-5 text-[0.8125rem] disabled:cursor-not-allowed"
          >
            Upload {files.length > 1 ? `${files.length} Images` : 'Image'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

export default UploadToLibraryModal;
