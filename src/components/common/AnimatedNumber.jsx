import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedNumber Component
 *
 * Smoothly animates numbers counting up or down
 * Uses requestAnimationFrame for smooth 60fps animation
 *
 * @param {number} value - Target value to animate to
 * @param {number} duration - Animation duration in milliseconds (default: 1000)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} prefix - Text to show before number (e.g., '$')
 * @param {string} suffix - Text to show after number (e.g., '%')
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
export const AnimatedNumber = ({
  value = 0,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  style = {}
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const startValue = startValueRef.current;
    startValueRef.current = startValue;
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (value - startValue) * easeOutQuart;

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={className} style={style}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

/**
 * AnimatedCurrency Component
 *
 * Animates currency values with proper formatting
 *
 * @param {number} value - Amount in dollars
 * @param {boolean} showCents - Whether to show cents (default: false)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
export const AnimatedCurrency = ({
  value = 0,
  showCents = false,
  className = '',
  style = {}
}) => {
  return (
    <AnimatedNumber
      value={value}
      duration={1000}
      decimals={showCents ? 2 : 0}
      prefix="$"
      className={className}
      style={style}
    />
  );
};

/**
 * AnimatedPercentage Component
 *
 * Animates percentage values
 *
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
export const AnimatedPercentage = ({
  value = 0,
  decimals = 0,
  className = '',
  style = {}
}) => {
  return (
    <AnimatedNumber
      value={value}
      duration={1000}
      decimals={decimals}
      suffix="%"
      className={className}
      style={style}
    />
  );
};
