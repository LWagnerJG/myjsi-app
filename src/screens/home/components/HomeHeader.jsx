import React from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../../components/common/SearchInput.jsx';
import { QuickActionDropdown } from '../../../components/common/QuickActionDropdown.jsx';

/* ── Elliott avatar URL (same as ChatOverlay) ──────────────────────── */
const ELLIOTT_AVATAR_URL =
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Elliott&top=shortFlat&hairColor=e8e1e1' +
    '&accessories=round&accessoriesProbability=100&accessoriesColor=262e33' +
    '&eyebrows=defaultNatural&eyes=happy&mouth=smile' +
    '&clothing=blazerAndShirt&clothesColor=25557c' +
    '&skinColor=ffdbb4&facialHairProbability=0';

export const HomeHeader = ({
    colors,
    todayLabel,
    theme,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    onVoiceActivate,
    handleQuickAction,
    spotlightResults,
    onNavigate,
    openChatFromQuery,
    hoverBg,
    isDark
}) => {
    return (
        <div className="relative group">
            {/* Dashboard label + search bar on one row */}
            <div className="flex items-center gap-4">
                <div className="shrink-0 hidden sm:block min-w-[120px]">
                    <h2 className="text-[28px] font-semibold tracking-tight leading-none" style={{ color: colors.textPrimary }}>Dashboard</h2>
                    <div className="text-[12px] font-medium whitespace-nowrap mt-1.5" style={{ color: colors.textSecondary, opacity: 0.5 }}>{todayLabel}</div>
                </div>

                <GlassCard
                theme={theme}
                className="relative z-10 px-5 flex items-center min-w-0 ml-auto w-full max-w-[760px]"
                style={{
                    borderRadius: 9999,
                    height: 56,
                    paddingTop: 0,
                    paddingBottom: 0,
                    backgroundColor: colors.tileSurface,
                    border: 'none',
                    boxShadow: colors.tileShadow
                }}
            >
                <HomeSearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={handleSearchSubmit}
                    onVoiceClick={() => onVoiceActivate && onVoiceActivate('Voice search active')}
                    theme={theme}
                    className="w-full"
                />
                {/* Quick Actions Dropdown (Plus button) */}
                <QuickActionDropdown 
                    theme={theme}
                    onActionSelect={handleQuickAction}
                    className="ml-2"
                />
            </GlassCard>
            </div>

                {searchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-20">
                        <GlassCard theme={theme} className="p-2" style={{
                            borderRadius: 20,
                            backgroundColor: isDark ? 'rgba(42,42,42,0.85)' : 'rgba(255,255,255,0.55)',
                            backdropFilter: 'blur(24px) saturate(1.8)',
                            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)'
                                : '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)'
                        }}>
                            <div className="space-y-1">
                                {spotlightResults.map((app) => (
                                    <button
                                        key={app.route}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            onNavigate?.(app.route);
                                            setSearchQuery('');
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${hoverBg} transition-colors`}
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}12` }}>
                                            <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{app.name}</div>
                                            <div className="text-xs" style={{ color: colors.textSecondary }}>{app.route}</div>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-1 pt-1" style={{ borderTop: `1px solid ${colors.border}` }}>
                                <button
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openChatFromQuery(searchQuery);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${hoverBg} transition-colors`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #E8D1C2 0%, #D3A891 100%)',
                                        }}
                                    >
                                        <img
                                            src={ELLIOTT_AVATAR_URL}
                                            alt="Elliott"
                                            width={32}
                                            height={32}
                                            className="w-full h-full"
                                            style={{ transform: 'scale(1.15) translateY(1px)' }}
                                            loading="eager"
                                        />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Ask Elliott</div>
                                        <div className="text-xs truncate" style={{ color: colors.textSecondary }}>Chat about &ldquo;{searchQuery}&rdquo;</div>
                                    </div>
                                    <div className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full flex-shrink-0" style={{
                                        backgroundColor: `${colors.accent}0F`,
                                        color: colors.textSecondary,
                                    }}>Elliott Bot</div>
                                </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
        </div>
    );
};
