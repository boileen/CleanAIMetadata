import React from 'react';

/**
 * AI Metadata Eraser - Official Brand Mark
 * Geometric dual-stroke shield with cyan privacy dot & tilted eraser.
 */
export default function LogoIcon({ className = 'w-8 h-8', isDark = false }) {
  const outerStroke = isDark ? '#3B82F6' : '#2563EB'; // Royal Blue
  const innerStroke = isDark ? '#FFFFFF' : '#081736'; // Navy or White
  const eraserFill = isDark ? '#081736' : '#FFFFFF';
  const dotFill = '#06B6D4'; // Cyan

  return (
    <svg
      viewBox="10 8 88 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Shield (Royal Blue) */}
      <path
        d="M 54 14
           L 86 28
           C 89 29, 91 32, 91 36
           L 91 56
           C 91 78, 73 96, 54 103
           C 35 96, 17 78, 17 56
           L 17 36
           C 17 32, 19 29, 22 28
           Z"
        stroke={outerStroke}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Shield */}
      <path
        d="M 54 26
           L 78 37
           C 80 38, 81 40, 81 42
           L 81 55
           C 81 72, 67 86, 54 92
           C 41 86, 27 72, 27 55
           L 27 42
           C 27 40, 28 38, 30 37
           Z"
        stroke={innerStroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={eraserFill}
      />

      {/* Cyan Center Dot */}
      <circle cx="54" cy="48" r="4.5" fill={dotFill} />

      {/* Eraser */}
      <g transform="translate(73, 75) rotate(42)">
        <rect x="-13" y="-21" width="26" height="42" rx="6" fill={eraserFill} />
        <rect
          x="-13"
          y="-21"
          width="26"
          height="42"
          rx="6"
          stroke={innerStroke}
          strokeWidth="6"
          strokeLinejoin="round"
          fill={eraserFill}
        />
        <line x1="-13" y1="-1" x2="13" y2="-1" stroke={innerStroke} strokeWidth="6" />
      </g>

      {/* Swipe line */}
      <path d="M 68 103 L 88 103" stroke={innerStroke} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
