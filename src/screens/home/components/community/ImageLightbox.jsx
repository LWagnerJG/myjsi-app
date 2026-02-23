import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share2, X } from 'lucide-react';

export const ImageLightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleDownload = useCallback(async () => {
    try {
      const resp = await fetch(src, { mode: 'cors' });
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (alt || 'image').replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  }, [src, alt]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: alt || 'Image', url: src });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(src);
      } catch {
        window.prompt('Copy this link:', src);
      }
    }
  }, [src, alt]);

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top-right actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          title="Download"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          title="Share"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          title="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      {/* Image */}
      <img
        src={src}
        alt={alt || 'Preview'}
        className="max-w-[92vw] max-h-[85vh] rounded-2xl object-contain select-none"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
      />
    </div>,
    document.body
  );
};
