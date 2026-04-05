import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';

export const IndieSconce = ({ isDarkMode, lampRight, handleLampClick, lampAnim, lampLightReady, lampOn }) => {
    if (!isDarkMode) return null;

    return ReactDOM.createPortal(
        <div
            className="select-none"
            style={{
                position: 'fixed',
                top: 6,
                right: lampRight,
                zIndex: 35,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
            }}
            onClick={handleLampClick}
            title="Turn light off"
        >
            {/* Perspective wrapper — subtle 3D depth */}
            <div style={{ perspective: '800px' }}>
                <div style={{ transform: 'rotateY(8deg) rotateX(-2deg)', transformStyle: 'preserve-3d' }}>
                    <motion.div
                        initial={{ y: -70, opacity: 0, rotate: 0 }}
                        animate={lampAnim}
                        style={{ transformOrigin: '80% 0%' }}
                    >
                        <svg width="40" height="42" viewBox="0 0 150 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="shadeFabric" x1="0.05" y1="0" x2="0.95" y2="1">
                                    <stop offset="0%" stopColor="#DDDAD6"/>
                                    <stop offset="25%" stopColor="#D4D1CC"/>
                                    <stop offset="55%" stopColor="#C9C6C1"/>
                                    <stop offset="100%" stopColor="#BDBAB4"/>
                                </linearGradient>
                                <linearGradient id="shadeShadow" x1="0" y1="0.5" x2="1" y2="0.5">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                    <stop offset="65%" stopColor="rgba(0,0,0,0)" />
                                    <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
                                </linearGradient>
                                <radialGradient id="shadeInnerGlow" cx="0.5" cy="0.85" r="0.6" fx="0.5" fy="0.9">
                                    <stop offset="0%" stopColor="rgba(255,220,165,0.12)"/>
                                    <stop offset="60%" stopColor="rgba(255,210,150,0.05)"/>
                                    <stop offset="100%" stopColor="rgba(255,200,140,0)"/>
                                </radialGradient>
                                <linearGradient id="woodMount" x1="0.5" y1="0" x2="0.5" y2="1">
                                    <stop offset="0%" stopColor="#D9C998"/>
                                    <stop offset="50%" stopColor="#CCBB86"/>
                                    <stop offset="100%" stopColor="#BFB078"/>
                                </linearGradient>
                                <filter id="lampShadow" x="-12%" y="-6%" width="124%" height="116%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                                    <feOffset dx="0" dy="1.5" result="offsetBlur"/>
                                    <feFlood floodColor="rgba(0,0,0,0.08)" result="color"/>
                                    <feComposite in2="offsetBlur" operator="in"/>
                                    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                                </filter>
                            </defs>

                            {/* Wooden dowel — just past shade bottom */}
                            <rect x="78" y="6" width="9" height="112" rx="4.5" fill="url(#woodMount)"/>
                            <rect x="78" y="6" width="9" height="112" rx="4.5" fill="none" stroke="rgba(140,120,75,0.18)" strokeWidth="0.6"/>
                            <line x1="82.5" y1="8" x2="82.5" y2="116" stroke="rgba(185,160,115,0.08)" strokeWidth="0.5"/>

                            {/* Small metal hook — compact curve tucked against top edge */}
                            <path d="M82.5 8 L82.5 0 C82.5 -4 88 -6 94 -5 C98 -4 99 0 97 4"
                                  stroke="#505660" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

                            {/* Metal ferrule collar at hook-dowel junction */}
                            <ellipse cx="82.5" cy="8" rx="6.5" ry="2.2" fill="#4A4E54"/>
                            <ellipse cx="82.5" cy="8" rx="6.5" ry="2.2" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4"/>

                            {/* Shade — straight trapezoid, tilted down-left */}
                            <g transform="rotate(3, 76, 60)">
                                <g filter="url(#lampShadow)">
                                    <path d="M42 28 L108 28 L126 108 L12 108 Z" fill="url(#shadeFabric)"/>
                                    <path d="M42 28 L108 28 L126 108 L12 108 Z" fill="url(#shadeShadow)"/>
                                    <path d="M42 28 L108 28 L126 108 L12 108 Z" fill="url(#shadeInnerGlow)"/>
                                    <path d="M42 28 L108 28 L126 108 L12 108 Z" stroke="rgba(160,155,148,0.22)" strokeWidth="0.6" fill="none"/>
                                    <line x1="44" y1="44" x2="110" y2="44" stroke="rgba(160,155,148,0.04)" strokeWidth="0.4"/>
                                    <line x1="36" y1="60" x2="117" y2="60" stroke="rgba(160,155,148,0.04)" strokeWidth="0.4"/>
                                    <line x1="28" y1="76" x2="122" y2="76" stroke="rgba(160,155,148,0.03)" strokeWidth="0.4"/>
                                    <line x1="20" y1="92" x2="127" y2="92" stroke="rgba(160,155,148,0.03)" strokeWidth="0.4"/>
                                </g>
                                {/* Top rim */}
                                <ellipse cx="75" cy="28" rx="33" ry="2.2" fill="rgba(205,200,194,0.35)"/>
                                {/* Bottom rim */}
                                <ellipse cx="69" cy="108" rx="57" ry="3.2" fill="rgba(200,190,175,0.30)"/>
                                <ellipse cx="69" cy="108.5" rx="55" ry="1.2" fill="rgba(255,235,200,0.10)"/>
                            </g>
                        </svg>
                    </motion.div>
                </div>
            </div>

            {/* Light effects — warm layered glow beneath shade */}
            {/* Primary light cone — starts at shade bottom */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 1 : 0 }}
                transition={{ duration: 2.2, ease: [0.15, 0.85, 0.3, 1] }}
                style={{ position: 'absolute', top: 35, left: '50%', transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '36px solid transparent', borderRight: '36px solid transparent',
                    borderTop: '300px solid rgba(255,225,170,0.045)',
                    pointerEvents: 'none', filter: 'blur(16px)' }} />
            {/* Warm inner glow — tighter cone */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.8 : 0 }}
                transition={{ duration: 1.8, ease: [0.15, 0.85, 0.3, 1], delay: 0.15 }}
                style={{ position: 'absolute', top: 35, left: '50%', transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '18px solid transparent', borderRight: '18px solid transparent',
                    borderTop: '200px solid rgba(255,218,165,0.055)',
                    pointerEvents: 'none', filter: 'blur(10px)' }} />
            {/* Hot spot glow at shade opening */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.7 : 0 }}
                transition={{ duration: 2.0, ease: [0.15, 0.85, 0.3, 1], delay: 0.3 }}
                style={{ position: 'absolute', top: 33, left: '50%', transform: 'translateX(-50%)',
                    width: 38, height: 10, borderRadius: '50%',
                    background: 'radial-gradient(ellipse at 50% 80%, rgba(255,232,195,0.18) 0%, rgba(255,218,165,0.06) 50%, transparent 80%)',
                    pointerEvents: 'none', filter: 'blur(3px)' }} />
            {/* Subtle ambient halo */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.4 : 0 }}
                transition={{ duration: 2.6, ease: [0.15, 0.85, 0.3, 1], delay: 0.5 }}
                style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
                    width: 80, height: 40, borderRadius: '50%',
                    background: 'radial-gradient(ellipse at 50% 70%, rgba(255,235,200,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none', filter: 'blur(8px)' }} />
        </div>,
        document.body
    );
};
