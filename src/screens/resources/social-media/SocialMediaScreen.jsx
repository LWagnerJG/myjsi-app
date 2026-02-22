import React, { useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { Instagram, Linkedin, Copy, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { SOCIAL_MEDIA_POSTS } from './data.js';

// Format relative / short date
const formatDate = (dStr) => {
  if(!dStr) return '';
  const d = new Date(dStr); if (isNaN(d)) return dStr;
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + 'd ago';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Attempt Web Share API (with file) � some mobile OS + browsers allow selecting Instagram from sheet.
async function tryNativeShare(post) {
  try {
    if (!navigator.canShare) return false;
    const resp = await fetch(post.url, { mode: 'cors' });
    if (!resp.ok) return false;
    const blob = await resp.blob();
    const fileType = blob.type || 'image/jpeg';
    const fileName = `jsi-post-${post.id}.${fileType.includes('png')? 'png':'jpg'}`;
    const file = new File([blob], fileName, { type: fileType });
    if (!navigator.canShare({ files:[file] })) return false;
    await navigator.share({ files:[file], text: post.caption });
    return true;
  } catch { return false; }
}

export const SocialMediaScreen = ({ theme }) => {
  const posts = (SOCIAL_MEDIA_POSTS||[]).sort((a,b)=> new Date(b.createdDate)-new Date(a.createdDate));
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const flash = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2400); };

  const copyCaption = (post, silent=false) => navigator.clipboard.writeText(post.caption).then(()=>!silent && flash('Caption copied'));

  const downloadImage = (post) => {
    const a = document.createElement('a'); a.href = post.url; a.download = `jsi-post-${post.id}.jpg`; document.body.appendChild(a); a.click(); a.remove();
  };

  const fallbackFlow = (post, platform) => {
    copyCaption(post, true); downloadImage(post); flash(`${platform}: caption copied & image saved. Paste in new post.`); };

  const openLinkedIn = (post) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.url)}`; // cannot preload image+caption programmatically
    window.open(url,'_blank','noopener');
  };

  const deepLinkInstagram = () => {
    const schemes = ['instagram://library','instagram://share','instagram://camera'];
    let i=0; const hop=()=>{ if(i>=schemes.length) return; window.location.href=schemes[i++]; setTimeout(hop,900); }; hop();
  };

  const shareInstagram = async (post) => {
    // Try native share first
    const ok = await tryNativeShare(post);
    if (ok) return; // user handled through share sheet
    fallbackFlow(post,'Instagram');
    deepLinkInstagram();
  };

  const shareLinkedIn = async (post) => {
    // Native share attempt (may appear as LinkedIn target on some devices)
    const ok = await tryNativeShare(post);
    if (!ok) { fallbackFlow(post,'LinkedIn'); }
    openLinkedIn(post);
  };

  const ImageBlock = ({ post }) => {
    const [errored,setErrored] = useState(false);
    return (
      <div className="aspect-square w-full rounded-xl overflow-hidden relative bg-black/5 cursor-pointer border" style={{ borderColor: theme.colors.border }} onClick={()=>setPreview(post)}>
        {!errored && <img src={post.url} alt={post.caption.slice(0,60)} className="w-full h-full object-cover select-none" loading="lazy" onError={()=>setErrored(true)} />}
        {errored && <div className="absolute inset-0 flex items-center justify-center text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Image unavailable</div>}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>{formatDate(post.createdDate)}</div>
      </div>
    );
  };

  const Card = ({ post }) => (
    <GlassCard theme={theme} className="p-4 space-y-3 w-full">
      <ImageBlock post={post} />
      <p className="text-sm leading-snug whitespace-pre-line" style={{ color: theme.colors.textPrimary }}>{post.caption}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <PillButton theme={theme} isSelected onClick={()=>shareInstagram(post)} size="compact" className="flex items-center gap-2">
          <Instagram className="w-4 h-4" /> Instagram
        </PillButton>
        <PillButton theme={theme} onClick={()=>shareLinkedIn(post)} size="compact" className="flex items-center gap-2">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </PillButton>
        <PillButton theme={theme} onClick={()=>copyCaption(post)} size="compact" className="flex items-center gap-2">
          <Copy className="w-4 h-4" /> Copy
        </PillButton>
      </div>
    </GlassCard>
  );

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: theme.colors.background }}>
      {/* Help bar */}
      <div className="px-4 pb-1">
        <PillButton theme={theme} onClick={()=>setShowHelp(h=>!h)} size="compact" className="flex items-center gap-1.5 text-xs">
          <Info className="w-3.5 h-3.5" /> How to use {showHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </PillButton>
        {showHelp && (
          <div className="mt-2">
            <GlassCard theme={theme} className="p-3 text-xs leading-relaxed">
              <p style={{ color: theme.colors.textSecondary }}>
                Tap Instagram / LinkedIn: we try native share (supports direct image on some devices). If not supported we copy the caption, download the image, and attempt to open the app. Complete the post by choosing the downloaded image and pasting the caption.
              </p>
            </GlassCard>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32 space-y-4">
        {posts.map(p=> <Card key={p.id} post={p} />)}
        {!posts.length && <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No content available.</div>}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setPreview(null)}>
          <div className="max-w-md w-full" onClick={(e)=>e.stopPropagation()}>
            <div className="relative rounded-xl overflow-hidden mb-3">
              <img src={preview.url} alt={preview.caption.slice(0,60)} className="w-full object-cover" />
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>{formatDate(preview.createdDate)}</div>
            </div>
            <GlassCard theme={theme} className="p-4 space-y-3">
              <p className="text-sm" style={{ color: theme.colors.textPrimary }}>{preview.caption}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <PillButton theme={theme} isSelected onClick={()=>shareInstagram(preview)} size="compact" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram
                </PillButton>
                <PillButton theme={theme} onClick={()=>shareLinkedIn(preview)} size="compact" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </PillButton>
                <PillButton theme={theme} onClick={()=>copyCaption(preview)} size="compact" className="flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Copy
                </PillButton>
                <PillButton theme={theme} onClick={()=>setPreview(null)} size="compact" className="ml-auto">
                  Close
                </PillButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: theme.colors.accent, color: theme.colors.accentText, boxShadow:'0 4px 12px rgba(0,0,0,0.12)' }}>{toast}</div>
      )}
    </div>
  );
};