import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FeaturePicker } from './FeaturePicker.jsx';
import { HomeFeatureContent } from './HomeFeatureContent.jsx';

const FeatureCard = ({
    theme,
    colors,
    isDark,
    isEditMode,
    mode,
    setMode,
    homeFeatureOptions,
    navigateFeature,
    leadTimeFavoritesData,
    communityPosts,
    onNavigate,
    opportunities,
    recentOrders,
    hoverBg,
    className = '',
}) => {
    const headerLabel = homeFeatureOptions.find(o => o.id === mode)?.label || 'Recent Activity';

    return (
    <GlassCard
        theme={theme}
        className={`flex flex-col transition-all duration-300 ${className}`}
        style={{
            borderRadius: 20,
            backgroundColor: colors.tileSurface,
            padding: 0,
            border: isEditMode
                ? `1.5px dashed ${isDark ? 'rgba(255,255,255,0.20)' : 'rgba(53,53,53,0.15)'}`
                : 'none',
            boxShadow: 'none',
        }}
        onClick={(e) => {
            if (isEditMode) return;
            if (e.target.closest('button, a, select')) return;
            navigateFeature(mode);
        }}
    >
        {/* Header */}
        <div className="flex items-center justify-between pl-5 pr-3.5 py-[13px] flex-shrink-0">
            <h4 className="text-[0.9375rem] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                    {headerLabel}
                </h4>
            {isEditMode ? (
                <FeaturePicker
                    value={mode}
                    onChange={setMode}
                    options={homeFeatureOptions}
                    colors={colors}
                    isDark={isDark}
                />
            ) : (
                <button
                    onClick={() => navigateFeature(mode)}
                    aria-label="Open recent activity"
                    className="group flex items-center justify-center transition-opacity hover:opacity-90"
                    style={{ color: colors.textSecondary }}
                >
                    <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-40 transition-opacity" style={{ color: colors.textSecondary }} />
                </button>
            )}
        </div>
        {isEditMode && (
            <p className="text-xs font-medium mb-2.5 px-5 flex items-center gap-1" style={{ color: colors.accent, opacity: 0.65 }}>
                <ChevronDown className="w-3 h-3" /> Use the dropdown above to change this card
            </p>
        )}
        {/* Thin divider */}
        <div className="mx-5 mb-0" style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
        <div className="px-4 pb-4 pt-1">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                >
                    <HomeFeatureContent
                        mode={mode}
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
    );
};

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
    const shared = {
        theme, colors, isDark, isEditMode, homeFeatureOptions, navigateFeature,
        leadTimeFavoritesData, communityPosts, onNavigate, opportunities, recentOrders, hoverBg,
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FeatureCard
                {...shared}
                mode={homeFeatureMode}
                setMode={setHomeFeatureMode}
            />
            <FeatureCard
                {...shared}
                mode={secondaryFeatureMode}
                setMode={setSecondaryFeatureMode}
                className="hidden sm:flex"
            />
        </div>
    );
};
