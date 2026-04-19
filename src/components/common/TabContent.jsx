import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { getTabContentMotion } from '../../design-system/motion.js';

// Wraps tab panel content with a fast crossfade keyed by `activeKey`.
// Pass children as the currently-active panel; swap children + key together.
export const TabContent = ({ activeKey, className = '', style, children }) => {
  const prefersReduced = usePrefersReducedMotion();
  const m = getTabContentMotion(prefersReduced);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        className={className}
        style={style}
        initial={m.initial}
        animate={m.animate}
        exit={m.exit}
        transition={m.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default TabContent;
