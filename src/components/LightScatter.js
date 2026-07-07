import React, { useEffect, useRef } from 'react';

export default function LightScatter() {
  const moteRef = useRef(null);

  useEffect(() => {
    const el = moteRef.current;
    if (!el) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 80; i++) {
      const m = document.createElement('div');
      const size = Math.random() * 2 + 0.5;
      const left = Math.random() * 100;
      const dur1 = Math.random() * 22 + 16;
      const dur2 = Math.random() * 8 + 5;
      const delay = Math.random() * -40;
      const peak = ((Math.random() * 0.3 + 0.1) * (1 - Math.abs(left - 50) / 50 * 0.6)).toFixed(2);

      Object.assign(m.style, {
        position: 'absolute', borderRadius: '50%',
        background: '#c8b8f0',
        width: `${size}px`, height: `${size}px`,
        left: `${left}%`, bottom: `${Math.random() * 30 - 15}%`,
        opacity: '0',
        animation: `drift ${dur1}s linear infinite, glow ${dur2}s ease-in-out infinite`,
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
        @keyframes drift { from { transform: translateY(0); } to { transform: translateY(-115vh); } }
        @keyframes glow { 0%,100% { opacity: 0; } 15% { opacity: var(--peak,0.25); } 85% { opacity: var(--peak,0.25); } }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #030105 0%, #020104 30%, #010002 60%, #000 100%)',
      }} />

      <div style={{
        position: 'absolute', top: '-35vmax', left: '50%',
        width: '120vmax', height: '100vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 45% 28% at 50% 0%, rgba(140,100,230,0.25) 0%, rgba(110,70,200,0.12) 30%, rgba(80,50,160,0.05) 55%, transparent 75%)',
        filter: 'blur(50px)',
        mixBlendMode: 'screen',
      }} />

      <div ref={moteRef} style={{ position: 'absolute', inset: 0 }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 65% at 50% 5%, transparent 10%, rgba(0,0,0,0.45) 50%, #000 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
