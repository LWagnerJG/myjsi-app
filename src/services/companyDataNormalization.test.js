import { describe, expect, it } from 'vitest';
import { normalizeResourcePayload, parseCsv } from '../../api/_companyData.js';

describe('company data normalization', () => {
    it('parses quoted CSV rows', () => {
        const rows = parseCsv('Series,Type,Weeks\n"Vision, Core",Laminate,8\nWink,Seating,3');

        expect(rows).toEqual([
            { Series: 'Vision, Core', Type: 'Laminate', Weeks: '8' },
            { Series: 'Wink', Type: 'Seating', Weeks: '3' },
        ]);
    });

    it('normalizes lead-time rows from CSV-style fields', () => {
        const data = normalizeResourcePayload('lead-times', [
            { Series: 'Wink', Type: 'Seating', Weeks: '3', QuickShip: 'yes' },
            { Series: '', Type: 'Seating', Weeks: '4' },
        ]);

        expect(data).toEqual([
            { series: 'Wink', type: 'Seating', weeks: 3, image: '', cloudinaryPublicId: '', quickShip: true },
        ]);
    });

    it('normalizes Cloudinary public IDs for live lead-time rows', () => {
        const data = normalizeResourcePayload('lead-times', [
            { Series: 'Arwyn', Type: 'Seating', Weeks: '8', 'Cloudinary Public ID': 'jsi_arwyn_comp_00032_oddogi' },
        ]);

        expect(data).toEqual([
            {
                series: 'Arwyn',
                type: 'Seating',
                weeks: 8,
                image: '',
                cloudinaryPublicId: 'jsi_arwyn_comp_00032_oddogi',
                quickShip: false,
            },
        ]);
    });

    it('normalizes live weight-rating rows', () => {
        const data = normalizeResourcePayload('weight-ratings', [
            {
                Series: 'Arwyn',
                'Weight Limit': '300 lbs',
                'Failure Test': '475',
                'Cloudinary Public ID': 'jsi_arwyn_comp_00032_oddogi',
                'Supported Types': 'Seating; Tables',
            },
        ]);

        expect(data).toEqual([
            {
                series: 'Arwyn',
                slug: 'arwyn',
                weightLimit: 300,
                failureTestLbs: 475,
                image: '',
                cloudinaryPublicId: 'jsi_arwyn_comp_00032_oddogi',
                supportedTypes: ['Seating', 'Tables'],
                certificationNote: '',
            },
        ]);
    });

    it('normalizes HubSpot company results into dealer directory rows', () => {
        const data = normalizeResourcePayload('dealer-directory', {
            results: [
                {
                    id: '123',
                    properties: {
                        name: 'Business Furniture LLC',
                        phone: '(574) 234-8176',
                        city: 'South Bend',
                        state: 'IN',
                        annualrevenue: '435000',
                    },
                },
            ],
        });

        expect(data[0]).toMatchObject({
            id: '123',
            name: 'Business Furniture LLC',
            phone: '(574) 234-8176',
            address: 'South Bend, IN',
            sales: 435000,
        });
    });

    it('keeps contract objects intact', () => {
        const contracts = {
            omnia: { id: 'omnia', name: 'Omnia' },
        };

        expect(normalizeResourcePayload('contracts', contracts)).toBe(contracts);
    });

    it('unwraps object payloads before normalizing contracts', () => {
        const contracts = {
            omnia: { id: 'omnia', name: 'Omnia' },
        };

        expect(normalizeResourcePayload('contracts', { data: contracts })).toBe(contracts);
    });
});
