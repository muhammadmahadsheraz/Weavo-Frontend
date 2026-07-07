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
      const dur2 = Math.random() * 10 + 12;
      const dur3 = Math.random() * 2.5 + 1.8;
      const delay = Math.random() * -30;
      const peak = (Math.random() * 0.35 + 0.15).toFixed(2);
      const dist = Math.abs(left - 50) / 50;
      const brightness = 1 - dist * 0.75;
      const inLight = Math.max(0, 1 - dist * 1.4);
      const sparkOp = (inLight * (Math.random() * 0.4 + 0.6)).toFixed(2);
      const sparkSize = (inLight * (Math.random() * 4 + 3)).toFixed(1);
      const sparkBright = (1 + inLight * (Math.random() * 1.6 + 1)).toFixed(2);

      Object.assign(m.style, {
        position: 'absolute', borderRadius: '50%',
        background: '#a78bfa',
        width: `${size}px`, height: `${size}px`,
        left: `${left}%`, bottom: `${Math.random() * 20 - 10}%`,
        opacity: '0', filter: 'blur(0.4px)',
        animation: `moteDrift ${dur1}s linear infinite, moteGlow ${dur2}s ease-in-out infinite, moteTwinkle ${dur3}s ease-in-out infinite`,
        animationDelay: `${delay}s, ${delay}s, ${delay}s`,
        '--peak': (peak * brightness).toString(),
        '--w': `${size}px`,
        '--spark': `${sparkSize}px`,
        '--sparkop': sparkOp,
        '--sparkbright': sparkBright,
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
        @keyframes shimmer1 {
          0%,100% { transform: translateX(-50%) rotate(0deg); filter: blur(11px) brightness(1); opacity: 1; }
          14% { transform: translateX(-50%) rotate(0.8deg); filter: blur(11px) brightness(1.15); opacity: 0.93; }
          29% { transform: translateX(-50%) rotate(-0.5deg); filter: blur(13px) brightness(0.88); opacity: 1; }
          45% { transform: translateX(-50%) rotate(0.9deg); filter: blur(10px) brightness(1.05); opacity: 0.9; }
          58% { transform: translateX(-50%) rotate(-0.5deg); filter: blur(12px) brightness(0.95); opacity: 1; }
          71% { transform: translateX(-50%) rotate(0.6deg); filter: blur(11px) brightness(1.1); opacity: 0.92; }
          88% { transform: translateX(-50%) rotate(-0.7deg); filter: blur(10px) brightness(0.9); opacity: 1; }
        }
        @keyframes shimmer2 {
          0%,100% { transform: translateX(-50%) rotate(0deg); filter: blur(13px) brightness(1); opacity: 0.8; }
          18% { transform: translateX(-50%) rotate(-0.8deg); filter: blur(15px) brightness(0.85); opacity: 0.68; }
          33% { transform: translateX(-50%) rotate(0.7deg); filter: blur(12px) brightness(1.15); opacity: 0.88; }
          50% { transform: translateX(-50%) rotate(-0.9deg); filter: blur(14px) brightness(0.9); opacity: 0.72; }
          64% { transform: translateX(-50%) rotate(0.9deg); filter: blur(11px) brightness(1.2); opacity: 0.9; }
          80% { transform: translateX(-50%) rotate(-1deg); filter: blur(13px) brightness(0.93); opacity: 0.75; }
        }
        @keyframes surfaceFlicker { 0%,100% { opacity: 0.85; } 45% { opacity: 1; } 50% { opacity: 0.65; } 55% { opacity: 0.95; } }
        @keyframes moteDrift { from { transform: translateY(0) scale(1); } to { transform: translateY(-112vh) scale(1); } }
        @keyframes moteGlow { 0%,100% { opacity: 0; } 15% { opacity: var(--peak,0.3); } 85% { opacity: var(--peak,0.3); } }
        @keyframes moteTwinkle {
          0%,100% { box-shadow: 0 0 0 rgba(255,255,255,0); filter: blur(0.4px) brightness(1) saturate(1); width: var(--w); height: var(--w); }
          28% { box-shadow: 0 0 0 rgba(255,255,255,0); filter: blur(0.4px) brightness(1) saturate(1); width: var(--w); height: var(--w); }
          36% { box-shadow: 0 0 var(--spark,0px) rgba(255,255,255,var(--sparkop,0)), 0 0 calc(var(--spark,0px) * 2) rgba(200,180,255,calc(var(--sparkop,0) * 0.6)); filter: blur(0.15px) brightness(var(--sparkbright,1)) saturate(0.4); width: calc(var(--w) * 1.7); height: calc(var(--w) * 1.7); }
          45% { box-shadow: 0 0 calc(var(--spark,0px) * 1.3) rgba(255,255,255,var(--sparkop,0)), 0 0 calc(var(--spark,0px) * 3) rgba(200,180,255,calc(var(--sparkop,0) * 0.6)); filter: blur(0.1px) brightness(calc(var(--sparkbright,1) * 1.15)) saturate(0.3); width: calc(var(--w) * 2); height: calc(var(--w) * 2); }
          58% { box-shadow: 0 0 calc(var(--spark,0px) * 1.3) rgba(255,255,255,var(--sparkop,0)), 0 0 calc(var(--spark,0px) * 3) rgba(200,180,255,calc(var(--sparkop,0) * 0.6)); filter: blur(0.1px) brightness(calc(var(--sparkbright,1) * 1.15)) saturate(0.3); width: calc(var(--w) * 2); height: calc(var(--w) * 2); }
          67% { box-shadow: 0 0 var(--spark,0px) rgba(255,255,255,var(--sparkop,0)), 0 0 calc(var(--spark,0px) * 2) rgba(200,180,255,calc(var(--sparkop,0) * 0.6)); filter: blur(0.15px) brightness(var(--sparkbright,1)) saturate(0.4); width: calc(var(--w) * 1.7); height: calc(var(--w) * 1.7); }
          75% { box-shadow: 0 0 0 rgba(255,255,255,0); filter: blur(0.4px) brightness(1) saturate(1); width: var(--w); height: var(--w); }
        }
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
        background: 'radial-gradient(ellipse 46% 32% at 50% 0%, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0.14) 28%, rgba(80,40,170,0.06) 50%, transparent 72%)',
        filter: 'blur(42px)', mixBlendMode: 'screen',
        animation: 'ambientBreathe 10s ease-in-out infinite',
      }} />

      {/* Ray band 1 — shimmering */}
      <div style={{
        position: 'absolute', top: '-28vmax', left: '50%',
        width: '220vmax', height: '220vmax',
        transformOrigin: '50% 0%',
        transform: 'translateX(-50%)',
        background: 'repeating-conic-gradient(from 152deg at 50% 0%, rgba(124,58,237,0.25) 0deg, rgba(124,58,237,0.04) 2.5deg, rgba(124,58,237,0.18) 5deg, rgba(124,58,237,0.02) 8deg, rgba(124,58,237,0.22) 11deg, rgba(124,58,237,0.03) 14deg, rgba(124,58,237,0.14) 17deg, rgba(124,58,237,0.02) 21deg, rgba(124,58,237,0.20) 25deg, rgba(124,58,237,0.03) 30deg, rgba(124,58,237,0.16) 34deg, rgba(124,58,237,0.02) 38deg, transparent 38.01deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 22%, rgba(0,0,0,0.7) 45%, transparent 78%)',
        maskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 22%, rgba(0,0,0,0.7) 45%, transparent 78%)',
        filter: 'blur(11px) brightness(1)',
        mixBlendMode: 'screen',
        animation: 'shimmer1 20s ease-in-out infinite',
      }} />

      {/* Ray band 2 — offset shimmer */}
      <div style={{
        position: 'absolute', top: '-28vmax', left: '50%',
        width: '220vmax', height: '220vmax',
        transformOrigin: '50% 0%',
        transform: 'translateX(-50%)',
        background: 'repeating-conic-gradient(from 158deg at 50% 0%, transparent 0deg, rgba(124,58,237,0.09) 3deg, transparent 6.5deg, transparent 10deg, rgba(6,182,212,0.08) 13deg, transparent 16.5deg, transparent 21deg, rgba(124,58,237,0.07) 24deg, transparent 28deg, transparent 32.01deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 18%, rgba(0,0,0,0.6) 42%, transparent 72%)',
        maskImage: 'radial-gradient(circle at 50% 0%, black 0%, black 18%, rgba(0,0,0,0.6) 42%, transparent 72%)',
        filter: 'blur(13px) brightness(1)',
        mixBlendMode: 'screen', opacity: 0.8,
        animation: 'shimmer2 28s ease-in-out infinite',
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
