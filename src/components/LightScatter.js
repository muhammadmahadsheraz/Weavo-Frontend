import React, { useEffect, useRef } from 'react';

export default function LightScatter() {
  const moteRef = useRef(null);

  useEffect(() => {
    const el = moteRef.current;
    if (!el) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 40; i++) {
      const m = document.createElement('div');
      const size = Math.random() * 1.8 + 0.4;
      const left = Math.random() * 100;
      const dur1 = Math.random() * 20 + 18;
      const dur2 = Math.random() * 8 + 6;
      const delay = Math.random() * -35;
      const peak = (Math.random() * 0.25 + 0.08).toFixed(2);

      Object.assign(m.style, {
        position: 'absolute', borderRadius: '50%',
        background: '#d4c8f0',
        width: `${size}px`, height: `${size}px`,
        left: `${left}%`, bottom: `${Math.random() * 30 - 15}%`,
        opacity: '0', filter: 'blur(0.3px)',
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
        @keyframes moteDrift { from { transform: translateY(0); } to { transform: translateY(-115vh); } }
        @keyframes moteGlow { 0%,100% { opacity: 0; } 15% { opacity: var(--peak,0.2); } 85% { opacity: var(--peak,0.2); } }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #050208 0%, #020103 40%, #010001 70%, #000 100%)',
      }} />

      <div style={{
        position: 'absolute', top: '-30vmax', left: '50%',
        width: '100vmax', height: '90vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 40% 25% at 50% 0%, rgba(200,190,240,0.15) 0%, rgba(140,120,200,0.06) 40%, transparent 65%)',
        filter: 'blur(50px)', mixBlendMode: 'screen',
        animation: 'breathe 12s ease-in-out infinite',
      }} />
      <style>{`@keyframes breathe { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }`}</style>

      <div className="motes" ref={moteRef} style={{ position: 'absolute', inset: 0 }} />

      <svg style={{
        position: 'absolute', inset: '-50%', width: '200%', height: '200%',
        opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none',
      }}>
        <filter id="nf">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#nf)" />
      </svg>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 70% at 50% 5%, transparent 15%, rgba(0,0,0,0.5) 55%, #000 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
