import React, { useEffect, useRef } from 'react';

export default function LightScatter() {
  const moteRef = useRef(null);

  useEffect(() => {
    const el = moteRef.current;
    if (!el) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 50; i++) {
      const m = document.createElement('div');
      const size = Math.random() * 2 + 0.5;
      const left = Math.random() * 100;
      const dur1 = Math.random() * 18 + 14;
      const dur2 = Math.random() * 6 + 4;
      const delay = Math.random() * -30;
      const dist = Math.abs(left - 50) / 50;
      const peak = ((Math.random() * 0.35 + 0.15) * (1 - dist * 0.75)).toFixed(2);

      Object.assign(m.style, {
        position: 'absolute', borderRadius: '50%',
        background: '#a78bfa', width: `${size}px`, height: `${size}px`,
        left: `${left}%`, bottom: `${Math.random() * 20 - 10}%`,
        opacity: '0', filter: 'blur(0.4px)',
        animation: `moteDrift ${dur1}s linear infinite, moteGlow ${dur2}s ease-in-out infinite`,
        animationDelay: `${delay}s, ${delay}s`,
        '--peak': peak,
      });
      frag.appendChild(m);
    }
    el.innerHTML = '';
    el.appendChild(frag);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes ambientBreathe { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        @keyframes raySway { 0%,100% { transform: translateX(-50%) rotate(-2.5deg); } 50% { transform: translateX(-50%) rotate(2.5deg); } }
        @keyframes raySway2 { 0%,100% { transform: translateX(-50%) rotate(3deg); } 50% { transform: translateX(-50%) rotate(-1.5deg); } }
        @keyframes surfaceFlicker { 0%,100% { opacity: 0.85; } 45% { opacity: 1; } 50% { opacity: 0.65; } 55% { opacity: 0.95; } }
        @keyframes moteDrift { from { transform: translateY(0); } to { transform: translateY(-112vh); } }
        @keyframes moteGlow { 0%,100% { opacity: 0; } 15% { opacity: var(--peak,0.3); } 85% { opacity: var(--peak,0.3); } }
      `}</style>

      {/* Ocean gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #050208 0%, #020103 35%, #010001 65%, #000 100%)',
      }} />

      {/* Ambient bloom */}
      <div style={{
        position: 'absolute', top: '-34vmax', left: '50%',
        width: '130vmax', height: '110vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 46% 32% at 50% 0%, rgba(124,58,237,0.28) 0%, rgba(124,58,237,0.14) 28%, rgba(80,40,170,0.06) 50%, transparent 72%)',
        filter: 'blur(42px)', mixBlendMode: 'screen',
        animation: 'ambientBreathe 10s ease-in-out infinite',
      }} />

      {/* Ray band 1 */}
      <div style={{
        position: 'absolute', top: '-28vmax', left: '50%',
        width: '220vmax', height: '220vmax',
        transformOrigin: '50% 0%',
        transform: 'translateX(-50%)',
        background: 'repeating-conic-gradient(from 152deg at 50% 0%, rgba(124,58,237,0.22) 0deg, rgba(124,58,237,0.03) 2.5deg, rgba(124,58,237,0.16) 5deg, rgba(124,58,237,0.02) 8deg, rgba(124,58,237,0.20) 11deg, rgba(124,58,237,0.03) 14deg, rgba(124,58,237,0.12) 17deg, rgba(124,58,237,0.02) 21deg, rgba(124,58,237,0.18) 25deg, rgba(124,58,237,0.03) 30deg, rgba(124,58,237,0.14) 34deg, rgba(124,58,237,0.02) 38deg, transparent 38.01deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 22%, rgba(0,0,0,0.7) 45%, transparent 78%)',
        maskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 22%, rgba(0,0,0,0.7) 45%, transparent 78%)',
        filter: 'blur(11px)', mixBlendMode: 'screen',
        animation: 'raySway 13s ease-in-out infinite',
      }} />

      {/* Ray band 2 */}
      <div style={{
        position: 'absolute', top: '-28vmax', left: '50%',
        width: '220vmax', height: '220vmax',
        transformOrigin: '50% 0%',
        transform: 'translateX(-50%)',
        background: 'repeating-conic-gradient(from 158deg at 50% 0%, transparent 0deg, rgba(124,58,237,0.08) 3deg, transparent 6.5deg, transparent 10deg, rgba(6,182,212,0.08) 13deg, transparent 16.5deg, transparent 21deg, rgba(124,58,237,0.07) 24deg, transparent 28deg, transparent 32.01deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 18%, rgba(0,0,0,0.6) 42%, transparent 72%)',
        maskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 18%, rgba(0,0,0,0.6) 42%, transparent 72%)',
        filter: 'blur(13px)', mixBlendMode: 'screen', opacity: 0.8,
        animation: 'raySway2 17s ease-in-out infinite',
      }} />

      {/* Surface brightening */}
      <div style={{
        position: 'absolute', top: '-16vmax', left: '50%',
        width: '70vmax', height: '20vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 55% 45% at 50% 100%, rgba(124,58,237,0.26) 0%, rgba(6,182,212,0.10) 45%, transparent 78%)',
        filter: 'blur(24px)', mixBlendMode: 'screen',
        animation: 'surfaceFlicker 4.5s ease-in-out infinite',
      }} />

      {/* Grain overlay */}
      <svg className="grain" style={{
        position: 'absolute', inset: '-50%',
        width: '200%', height: '200%',
        opacity: 0.045, mixBlendMode: 'overlay', pointerEvents: 'none',
      }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 62% 68% at 50% 6%, transparent 18%, rgba(0,0,0,0.55) 58%, #000 100%)',
        pointerEvents: 'none',
      }} />

      {/* Motes container */}
      <div ref={moteRef} className="motes" style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}
