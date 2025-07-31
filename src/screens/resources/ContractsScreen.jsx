import React, { useState, useMemo } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup.jsx';
import { Share2, ExternalLink } from 'lucide-react';
import * as Data from '../../data.jsx';

export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [activeContract, setActiveContract] = useState('omnia');

    const contracts = useMemo(() => ({
        omnia: Data.CONTRACTS_DATA.omnia,
        tips: Data.CONTRACTS_DATA.tips,
        premier: Data.CONTRACTS_DATA.premier,
    }), []);

    // A new, highly-styled component to display the details of the selected contract
    const ContractDetails = ({ contract, theme }) => {

        const handleShare = async () => {
            const shareText = `Check out the JSI ${contract.name} contract details.`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${contract.name} Contract Details`,
                        text: shareText,
                        url: window.location.href,
                    });
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                navigator.clipboard.writeText(shareText);
                if (setSuccessMessage) {
                    setSuccessMessage("Content copied to clipboard!");
                    setTimeout(() => setSuccessMessage(""), 2000);
                }
            }
        };

        return (
            <GlassCard theme={theme} className="p-4 space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                        {contract.name}
                    </h2>
                    <button onClick={handleShare} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <Share2 className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                {/* Tiers */}
                <div className="space-y-3">
                    {contract.tiers.map((tier, i) => (
                        <div key={i} className="rounded-2xl p-4 flex items-center space-x-4" style={{ backgroundColor: theme.colors.subtle }}>
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4" style={{ borderColor: theme.colors.accent, color: theme.colors.accent }}>
                                <span className="text-4xl font-bold tracking-tighter">{tier.off.split(' ')[0]}</span>
                                <span className="text-xs font-bold uppercase tracking-wider -mt-1">OFF</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    {tier.off.substring(tier.off.indexOf("(") + 1, tier.off.lastIndexOf(")"))}
                                </p>
                                <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.colors.textSecondary }}>Dealer commission</span>
                                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{tier.dealer.replace(' dealer commission', '')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.colors.textSecondary }}>Rep commission</span>
                                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{tier.rep.replace(' rep commission', '')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Margin/Notes Section */}
                {(contract.margin || contract.note) && (
                    <div className="text-sm space-y-3 pt-3 border-t" style={{ borderColor: theme.colors.subtle }}>
                        {contract.margin && (
                            <div className="px-2">
                                <p className="font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Dealer Margin Discount
                                </p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {contract.margin.join('  •  ')}
                                </p>
                            </div>
                        )}
                        {contract.note && (
                            <p className="italic px-2" style={{ color: theme.colors.textSecondary }}>
                                {contract.note}
                            </p>
                        )}
                    </div>
                )}

                {/* Link Button */}
                <div className="pt-2">
                    <button
                        onClick={() => window.open(contract.url, '_blank')}
                        className="w-full font-bold py-3 px-5 rounded-full flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        <span>View Full Contract</span>
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Contracts" theme={theme} />
            
            <div className="px-4 py-6 space-y-4">
                <ToggleButtonGroup
                    value={activeContract}
                    onChange={setActiveContract}
                    options={[
                        { label: "Omnia", value: "omnia" },
                        { label: "TIPS", value: "tips" },
                        { label: "Premier", value: "premier" },
                    ]}
                    theme={theme}
                />

                <ContractDetails contract={contracts[activeContract]} theme={theme} />
            </div>
        </div>
    );
};
