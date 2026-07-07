import React from 'react';

export default function Logo({ iconSize = 32, fontSize = 16, showText = true, className = '' }) {
  const padding = Math.round(iconSize * 0.25);
  const svgSize = Math.round(iconSize * 0.5);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg,#7C3AED,#06B6D4)',
        }}
      >
        <svg width={svgSize} height={svgSize} viewBox="0 0 16 16" fill="none">
          <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="white" fillOpacity="0.92" />
        </svg>
      </div>
      {showText && (
        <span
          className="font-bold tracking-tight"
          style={{ color: '#fff', fontSize, letterSpacing: '-0.02em' }}
        >
          Weavo <span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
}
