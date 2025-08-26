import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Central motion tokens
export const motionTokens = {
  dur: { fast: 0.12, base: 0.20, slow: 0.32 },
  ease: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 140, damping: 22, mass: 0.8 }
};

export const FadeIn = ({ children, delay = 0, as = 'div', variants, ...rest }) => {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={variants || { hidden: { opacity: 0 }, show: { opacity: 1 } }}
      transition={{ duration: motionTokens.dur.base, ease: motionTokens.ease, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export const ScaleFade = ({ children, delay = 0, as = 'div', ...rest }) => {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 4 }}
      transition={{ duration: motionTokens.dur.base, ease: motionTokens.ease, delay }}
      {...rest}
    >{children}</Comp>
  );
};

// Popover container with presence
export const PopoverMotion = ({ show, children, ...rest }) => (
  <AnimatePresence>{show && <ScaleFade {...rest}>{children}</ScaleFade>}</AnimatePresence>
);

export { motion, AnimatePresence };
