import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FeaturePicker } from './FeaturePicker.jsx';
import { HomeFeatureContent } from './HomeFeatureContent.jsx';

export const HomeFeatureCards = ({
    theme,
    colors,
    isDark,
    isEditMode,
    homeFeatureMode,
    setHomeFeatureMode,
    secondaryFeatureMode,
    setSecondaryFeatureMode,
    homeFeatureOptions,
    navigateFeature,
    leadTimeFavoritesData,
    communityPosts,
    onNavigate,
    opportunities,
    recentOrders,
    hoverBg
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0" style={{ gap: 'var(--section-gap)' }}>
            <GlassCard
                theme={theme}
                className={`flex flex-col cursor-pointer transition-all duration-300 overflow-hidden ${isEditMode ? 'ring-2 ring-dashed' : ''}`}
                style={{
                    borderRadius: 24,
                    backgroundColor: colors.tileSurface,
                    padding: 0,
                    border: isEditMode
                        ? `2px dashed ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.20)'}`
                        : 'none',
                    boxShadow: isEditMode ? 'none' : colors.tileShadow,
                }}
                onClick={(e) => {
                    if (isEditMode) return;
                    if (e.target.closest('button, a, select')) return;
                    navigateFeature(homeFeatureMode);
                }}
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
                    <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                        {homeFeatureOptions.find(o => o.id === homeFeatureMode)?.label || 'Recent Activity'}
                    </h4>
                    {isEditMode ? (
                        <FeaturePicker
                            value={homeFeatureMode}
                            onChange={setHomeFeatureMode}
                            options={homeFeatureOptions}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : (
                        <button
                            onClick={() => navigateFeature(homeFeatureMode)}
                            className="text-[9.5px] font-medium flex items-center gap-0.5 transition-opacity hover:opacity-60"
                            style={{ color: colors.textSecondary, opacity: 0.35 }}
                        >
                            Open
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                {isEditMode && (
                    <p className="text-[11px] font-medium mb-3 px-6 flex items-center gap-1" style={{ color: colors.accent, opacity: 0.7 }}>
                        <ChevronDown className="w-3 h-3" /> Use the dropdown above to change this card's content
                    </p>
                )}
                <div className={`flex-1 min-h-0 px-6 pb-5 ${isEditMode ? 'overflow-visible' : 'overflow-y-auto scrollbar-hide'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={homeFeatureMode}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            <HomeFeatureContent
                                mode={homeFeatureMode}
                                colors={colors}
                                leadTimeFavoritesData={leadTimeFavoritesData}
                                communityPosts={communityPosts}
                                onNavigate={onNavigate}
                                opportunities={opportunities}
                                recentOrders={recentOrders}
                                hoverBg={hoverBg}
                                isDark={isDark}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </GlassCard>

            <GlassCard
                theme={theme}
                className={`hidden sm:flex flex-col cursor-pointer transition-all duration-300 overflow-hidden`}
                style={{
                    borderRadius: 24,
                    backgroundColor: colors.tileSurface,
                    padding: 0,
                    border: isEditMode
                        ? `2px dashed ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.20)'}`
                        : 'none',
                    boxShadow: isEditMode ? 'none' : colors.tileShadow,
                }}
                onClick={(e) => {
                    if (isEditMode) return;
                    if (e.target.closest('button, a, select')) return;
                    navigateFeature(secondaryFeatureMode);
                }}
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
                    <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                        {homeFeatureOptions.find(o => o.id === secondaryFeatureMode)?.label || 'Community'}
                    </h4>
                    {isEditMode ? (
                        <FeaturePicker
                            value={secondaryFeatureMode}
                            onChange={setSecondaryFeatureMode}
                            options={homeFeatureOptions}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : (
                        <button
                            onClick={() => navigateFeature(secondaryFeatureMode)}
                            className="text-[9.5px] font-medium flex items-center gap-0.5 transition-opacity hover:opacity-60"
                            style={{ color: colors.textSecondary, opacity: 0.35 }}
                        >
                            Open
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                {isEditMode && (
                    <p className="text-[11px] font-medium mb-3 px-6 flex items-center gap-1" style={{ color: colors.accent, opacity: 0.7 }}>
                        <ChevronDown className="w-3 h-3" /> Use the dropdown above to change this card's content
                    </p>
                )}
                <div className={`flex-1 min-h-0 px-6 pb-5 ${isEditMode ? 'overflow-visible' : 'overflow-y-auto scrollbar-hide'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={secondaryFeatureMode}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            <HomeFeatureContent
                                mode={secondaryFeatureMode}
                                colors={colors}
                                leadTimeFavoritesData={leadTimeFavoritesData}
                                communityPosts={communityPosts}
                                onNavigate={onNavigate}
                                opportunities={opportunities}
                                recentOrders={recentOrders}
                                hoverBg={hoverBg}
                                isDark={isDark}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </GlassCard>
        </div>
    );
};
