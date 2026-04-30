import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { MOTION_DURATIONS_MS, MOTION_EASINGS } from '../../design-system/motion.js';

const SLIDE_PX = 50;
const DURATION_S = MOTION_DURATIONS_MS.fast / 1000;

// Wraps tab panel content with a directional slide + crossfade.
// Pass `tabIndex` (the numeric position of the active tab in its options array)
// so the component can determine whether to slide left or right.
// Falls back to a simple fade when `tabIndex` is omitted.
export const TabContent = ({ activeKey, tabIndex = 0, className = '', style, children }) => {
  const prefersReduced = usePrefersReducedMotion();
  const prevIndexRef = useRef(tabIndex);
  const dirRef = useRef(0);

  // Compute direction on each render (before AnimatePresence evaluates)
  if (tabIndex !== prevIndexRef.current) {
    dirRef.current = tabIndex > prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = tabIndex;
  }

  const dir = dirRef.current;

  const variants = {
    enter: (d) => prefersReduced
      ? { opacity: 0 }
      : { opacity: 0, x: d * SLIDE_PX },
    center: { opacity: 1, x: 0 },
    // Exit is instant — no visible gap between outgoing and incoming panels
    exit: { opacity: 0, transition: { duration: 0 } },
  };

  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div
        key={activeKey}
        custom={dir}
        className={className}
        style={style}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={prefersReduced
          ? { duration: 0 }
          : { duration: DURATION_S, ease: MOTION_EASINGS.standard }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default TabContent;
