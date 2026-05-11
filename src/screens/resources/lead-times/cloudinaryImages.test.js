import { describe, expect, it } from 'vitest';
import { getLeadTimeImageSources, getLeadTimeImageUrl, LEAD_TIME_IMAGE_TRANSFORM } from './cloudinaryImages.js';

describe('lead-time Cloudinary image resolver', () => {
    it('converts local series image paths to Cloudinary delivery URLs', () => {
        const url = getLeadTimeImageUrl({ image: '/series-images/jsi_arwyn_comp_0001.jpg' }, 'Arwyn');

        expect(url).toBe(`https://res.cloudinary.com/jasper-jsi-furniture/image/upload/${LEAD_TIME_IMAGE_TRANSFORM}/jsi_arwyn_comp_00032_oddogi`);
    });

    it('uses explicit live Cloudinary public IDs before fallback series images', () => {
        const sources = getLeadTimeImageSources({
            image: '/series-images/jsi_addison_comp_00014.jpg',
            cloudinaryPublicId: 'custom_lead_time_asset',
        }, 'Addison');

        expect(sources[0]).toContain('/custom_lead_time_asset');
        expect(sources[1]).toContain('/jsi_addison_comp_00014_clwpn4');
    });

    it('falls back to Cloudinary series assets when static data has no image', () => {
        const url = getLeadTimeImageUrl({ image: '' }, 'Draft');

        expect(url).toContain('/jsi_draft_comp_00001_fx1jms');
    });

    it('does not use unresolved local paths as Cloudinary asset guesses', () => {
        const sources = getLeadTimeImageSources({ image: '/series-images/jsi_mittle_comp_00001.jpg' }, 'Mittle');

        expect(sources).toEqual([]);
    });
});
