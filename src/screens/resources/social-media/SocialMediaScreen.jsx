import React, { useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Download, Share2, Instagram, Linkedin, Copy, Info } from 'lucide-react';
import { SOCIAL_MEDIA_POSTS } from './data.js';

const formatDate = (dStr) => {
  if(!dStr) return '';
  const d = new Date(dStr);
  if (isNaN(d)) return dStr;
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + 'd ago';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const SocialMediaScreen = ({ theme }) => {
  const posts = (SOCIAL_MEDIA_POSTS||[]).sort((a,b)=> new Date(b.createdDate)-new Date(a.createdDate));
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const flash = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2400); };

  const downloadImage = (post, silent=false) => {
    const a = document.createElement('a');
    a.href = post.url; a.download = `jsi-post-${post.id}.jpg`; document.body.appendChild(a); a.click(); a.remove();
    if(!silent) flash('Image downloaded');
  };

  const copyCaption = (post, silent=false) => { navigator.clipboard.writeText(post.caption).then(()=>{ if(!silent) flash('Caption copied'); }); };

  const shareLinkedIn = (post) => {
    // LinkedIn share endpoint (cannot pre-attach image or caption automatically). We copy caption & download image for user.
    copyCaption(post,true); downloadImage(post,true); flash('Caption copied & image downloaded. Paste on LinkedIn.');
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.url)}`;
    window.open(shareUrl,'_blank','noopener');
  };

  const shareInstagram = (post) => {
    // No web API to prefill; attempt deep links. Provide assets (caption + image) first.
    copyCaption(post,true); downloadImage(post,true);
    flash('Caption copied & image saved. Opening Instagram…');
    const deepLinks = [
      'instagram://library', // opens library (iOS)
      'instagram://share',
      'instagram://camera'
    ];
    let tried = 0;
    const tryNext = () => { if (tried >= deepLinks.length) return; window.location.href = deepLinks[tried++]; setTimeout(()=>{ if(tried<deepLinks.length) tryNext(); }, 900); };
    tryNext();
  };

  const Card = ({ post }) => (
    <GlassCard theme={theme} className="p-4 space-y-3 w-full relative overflow-hidden">
      <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>{formatDate(post.createdDate)}</div>
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-black/5 cursor-pointer border" style={{ borderColor: theme.colors.border }} onClick={()=>setPreview(post)}>
        <img src={post.url} alt={post.caption.slice(0,50)} className="w-full h-full object-cover select-none" loading="lazy" />
      </div>
      <p className="text-sm leading-snug whitespace-pre-line" style={{ color: theme.colors.textPrimary }}>{post.caption}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <button onClick={()=>downloadImage(post)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>
          <Download className="w-4 h-4" /> Download
        </button>
        <button onClick={()=>shareInstagram(post)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.accent, color:'#fff' }}>
          <Instagram className="w-4 h-4" /> IG
        </button>
        <button onClick={()=>shareLinkedIn(post)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
          <Linkedin className="w-4 h-4" /> LinkedIn
        </button>
        <button onClick={()=>copyCaption(post)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>
          <Copy className="w-4 h-4" /> Copy
        </button>
      </div>
    </GlassCard>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: theme.colors.background }}>
      <div className="px-4 pt-3 pb-2 flex items-start gap-2">
        <button onClick={()=>setShowInfo(p=>!p)} className="ml-auto px-3 py-2 rounded-full text-[11px] font-semibold flex items-center gap-1" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>
          <Info className="w-3.5 h-3.5" /> How to use
        </button>
      </div>
      {showInfo && (
        <div className="px-4 pb-2 -mt-2">
          <GlassCard theme={theme} className="p-4 text-xs space-y-2">
            <p style={{ color: theme.colors.textSecondary }}>Tap IG or LinkedIn: we copy the caption & download the image automatically (platforms do not allow auto-preloading both). Open the target app, start a new post, select the downloaded image, then paste.</p>
          </GlassCard>
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32 space-y-4">
        {posts.map(p=> <Card key={p.id} post={p} />)}
        {!posts.length && <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No content available.</div>}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setPreview(null)}>
          <div className="max-w-md w-full" onClick={(e)=>e.stopPropagation()}>
            <img src={preview.url} alt={preview.caption.slice(0,60)} className="w-full rounded-xl mb-3" />
            <GlassCard theme={theme} className="p-4 space-y-3">
              <div className="text-[11px] font-semibold opacity-70" style={{ color: theme.colors.textSecondary }}>{formatDate(preview.createdDate)}</div>
              <p className="text-sm" style={{ color: theme.colors.textPrimary }}>{preview.caption}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={()=>downloadImage(preview)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}><Download className="w-4 h-4" /> Download</button>
                <button onClick={()=>shareInstagram(preview)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.accent, color:'#fff' }}><Instagram className="w-4 h-4" /> IG</button>
                <button onClick={()=>shareLinkedIn(preview)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}><Linkedin className="w-4 h-4" /> LinkedIn</button>
                <button onClick={()=>copyCaption(preview)} className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}><Copy className="w-4 h-4" /> Copy</button>
                <button onClick={()=>setPreview(null)} className="ml-auto px-3 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary }}>Close</button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.accent, color:'#fff', boxShadow:'0 4px 16px rgba(0,0,0,0.25)' }}>{toast}</div>
      )}
    </div>
  );
};