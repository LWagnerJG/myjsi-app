// Exports the Good · Better · Best deck as a polished, multi-page PDF — one
// landscape page per category. Built with jsPDF directly (crisp vector text +
// embedded JPEGs) for deterministic output. jsPDF is dynamically imported so it
// stays out of the main bundle until a user exports.
//
// Requires res.cloudinary.com in the CSP connect-src (see vercel.json) so the
// product photos can be fetched as data URLs.
import { GOOD_BETTER_BEST_DECK, GBB_TIERS, formatGbbPrice, CLOUDINARY_BASE } from './goodBetterBestData.js';

const PAGE_W = 1123;
const PAGE_H = 794;
const MARGIN = 56;

const RGB = {
    charcoal: [53, 53, 53],
    slate: [91, 123, 140],
    muted: [138, 133, 124],
    faint: [179, 174, 165],
    border: [227, 224, 216],
};
const DOT = { good: [154, 145, 136], better: [91, 123, 140], best: [74, 124, 89] };

// JPEG on a clean white background, sized 4:3 to match the card image area.
const pdfImageUrl = (publicId) =>
    `${CLOUDINARY_BASE}/c_pad,w_660,h_495,b_white/f_jpg/q_90/v1/${publicId}`;

const fetchJpeg = async (url) => {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
    });
};

export async function downloadGbbPdf({ showPricing = true } = {}) {
    const deck = GOOD_BETTER_BEST_DECK;

    // Preload every product image as a JPEG data URL (CSP must allow Cloudinary).
    const dataUrls = {};
    await Promise.all(
        deck.sections.flatMap((section) =>
            GBB_TIERS.map(async (t) => {
                const d = section.tiers[t.id];
                try { dataUrls[`${section.id}.${t.id}`] = await fetchJpeg(pdfImageUrl(d.publicId)); }
                catch { dataUrls[`${section.id}.${t.id}`] = null; }
            })
        )
    );

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [PAGE_W, PAGE_H], hotfixes: ['px_scaling'] });

    const colW = (PAGE_W - MARGIN * 2 - 48) / 3; // three columns, 24px gaps
    const cardTop = 192;
    const cardH = 420;
    const imgY = cardTop + 7;
    const imgH = (colW - 2) * 0.755; // ~4:3, matches the source aspect

    deck.sections.forEach((section, si) => {
        if (si > 0) doc.addPage([PAGE_W, PAGE_H], 'landscape');

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...RGB.muted);
        doc.text('GOOD   ·   BETTER   ·   BEST', MARGIN, 60);
        doc.setFont('courier', 'normal');
        doc.setTextColor(...RGB.faint);
        doc.text(`${String(si + 1).padStart(2, '0')} / ${String(deck.sections.length).padStart(2, '0')}`, PAGE_W - MARGIN, 60, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(46);
        doc.setTextColor(...RGB.charcoal);
        doc.text(section.title, MARGIN, 116);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...RGB.slate);
        doc.text(doc.splitTextToSize(section.blurb, 780), MARGIN, 146);

        // Cards
        GBB_TIERS.forEach((tier, ci) => {
            const d = section.tiers[tier.id];
            const x = MARGIN + ci * (colW + 24);

            doc.setDrawColor(...RGB.border);
            doc.setLineWidth(1);
            doc.roundedRect(x, cardTop, colW, cardH, 12, 12, 'S');

            // Tier color bar
            doc.setFillColor(...DOT[tier.id]);
            doc.rect(x + 1, cardTop + 1, colW - 2, 6, 'F');

            // Image (white background already baked in)
            doc.setFillColor(255, 255, 255);
            doc.rect(x + 1, imgY, colW - 2, imgH, 'F');
            const du = dataUrls[`${section.id}.${tier.id}`];
            if (du) {
                try { doc.addImage(du, 'JPEG', x + 1, imgY, colW - 2, imgH); } catch { /* skip */ }
            }

            const textX = x + 18;
            // Tier label + dot
            const labelY = imgY + imgH + 30;
            doc.setFillColor(...DOT[tier.id]);
            doc.circle(textX + 3, labelY - 3, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...RGB.muted);
            doc.text(tier.label.toUpperCase(), textX + 12, labelY);

            // Series
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(...RGB.charcoal);
            doc.text(d.series, textX, labelY + 26);

            // Model
            doc.setFont('courier', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...RGB.muted);
            doc.text(d.model, textX, labelY + 42);

            // Spec (wrapped, up to 2 lines)
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11.5);
            doc.setTextColor(...RGB.slate);
            const specLines = doc.splitTextToSize(d.spec, colW - 36).slice(0, 2);
            doc.text(specLines, textX, labelY + 64);

            // Price (anchored near the card bottom, well clear of the spec)
            if (showPricing) {
                const priceY = cardTop + cardH - 24;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(30);
                doc.setTextColor(...RGB.charcoal);
                const priceStr = `$${formatGbbPrice(d.price)}`;
                doc.text(priceStr, textX, priceY);
                const pw = doc.getTextWidth(priceStr);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(...RGB.muted);
                doc.text('list', textX + pw + 6, priceY);
            }
        });

        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...RGB.faint);
        doc.text('JSI Furniture   ·   Grade A list pricing   ·   myjsi-app.vercel.app', MARGIN, PAGE_H - 30);
    });

    doc.save('JSI-Good-Better-Best.pdf');
}
