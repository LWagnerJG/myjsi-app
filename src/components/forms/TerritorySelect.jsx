import React from 'react';

export const TerritoryData = {
    'North America': ['USA', 'Canada', 'Mexico'],
    'Europe': ['Germany', 'France', 'United Kingdom', 'Spain', 'Italy', 'Netherlands', 'Sweden'],
    'Asia Pacific': ['Japan', 'Australia', 'China', 'South Korea', 'Singapore', 'India'],
    'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia'],
    'Middle East & Africa': ['UAE', 'Saudi Arabia', 'South Africa', 'Egypt']
};

export const TerritorySelect = ({ onSelect, theme, className = '' }) => {
    const [selectedRegion, setSelectedRegion] = React.useState('');
    const [selectedCountry, setSelectedCountry] = React.useState('');

    const regions = Object.keys(TerritoryData);
    const countries = selectedRegion ? TerritoryData[selectedRegion] : [];

    const handleRegionChange = (region) => {
        setSelectedRegion(region);
        setSelectedCountry('');
        if (onSelect) onSelect({ region, country: '' });
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        if (onSelect) onSelect({ region: selectedRegion, country });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Region
                </label>
                <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        color: theme.colors.textPrimary
                    }}
                >
                    <option value="">Select a region</option>
                    {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
            </div>

            {selectedRegion && (
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                        Country
                    </label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                            color: theme.colors.textPrimary
                        }}
                    >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};