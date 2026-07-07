import React, { useEffect, useRef } from 'react';

export default function LightScatter() {
  const moteRef = useRef(null);

  useEffect(() => {
    const el = moteRef.current;
    if (!el) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 72; i++) {
      const m = document.createElement('div');
      const size = Math.random() * 2.4 + 0.6;
      const left = Math.random() * 100;
      const dur1 = Math.random() * 22 + 16;
      const dur2 = Math.random() * 11 + 9;
      const delay = Math.random() * -38;
      const peak = (Math.random() * 0.42 + 0.18).toFixed(2);
      const distFromCenter = Math.abs(left - 50) / 50;
      const brightness = Math.max(0.3, 1 - distFromCenter * 0.82);
      const sway = (Math.random() - 0.5) * 18 + 'px';

      Object.assign(m.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: '#e4d6ff',
        boxShadow: '0 0 3px rgba(230,210,255,0.6)',
        width: `${size}px`, height: `${size}px`,
        left: `${left}%`,
        bottom: `${Math.random() * 25 - 12}%`,
        opacity: '0',
        filter: 'blur(0.6px)',
        animation: `drift ${dur1}s linear infinite, glow ${dur2}s ease-in-out infinite`,
        animationDelay: `${delay}s, ${delay + Math.random() * 4}s`,
        '--peak': (peak * brightness).toString(),
        '--sway': sway,
      });
      frag.appendChild(m);
    }
    el.innerHTML = '';
    el.appendChild(frag);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes drift { from { transform: translateY(0) translateX(0) scale(1); } to { transform: translateY(-118vh) translateX(var(--sway)) scale(0.85); } }
        @keyframes glow { 0%,100% { opacity:0; } 18% { opacity:var(--peak,0.45); } 82% { opacity:var(--peak,0.45); } }
        @keyframes breathe { 0%,100% { opacity:0.74; } 50% { opacity:0.89; } }
        @keyframes shimmer1 { 0%,100% { filter:blur(20px) brightness(0.78); opacity:0.82; } 21% { filter:blur(21px) brightness(0.92); opacity:0.91; } 43% { filter:blur(19px) brightness(0.71); opacity:0.76; } 67% { filter:blur(20px) brightness(0.87); opacity:0.86; } 89% { filter:blur(22px) brightness(0.75); opacity:0.80; } }
        @keyframes shimmer2 { 0%,100% { transform:translateX(-50%) rotate(-0.4deg); filter:blur(24px) brightness(0.74); opacity:0.58; } 17% { transform:translateX(-50%) rotate(0.7deg); filter:blur(22px) brightness(1.02); opacity:0.76; } 35% { transform:translateX(-50%) rotate(-0.8deg); filter:blur(25px) brightness(0.67); opacity:0.53; } 53% { transform:translateX(-50%) rotate(0.6deg); filter:blur(23px) brightness(0.96); opacity:0.71; } 71% { transform:translateX(-50%) rotate(-0.5deg); filter:blur(26px) brightness(0.69); opacity:0.56; } 84% { transform:translateX(-50%) rotate(0.9deg); filter:blur(22px) brightness(0.99); opacity:0.74; } }
        @keyframes flicker { 0%,100% { opacity:0.72; } 42% { opacity:0.91; } 55% { opacity:0.65; } 74% { opacity:0.86; } }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #0a061f 0%, #05031a 38%, #02020f 68%, #010103 100%)',
      }} />

      <div style={{
        position: 'absolute', top: '-45vmax', left: '50%',
        width: '170vmax', height: '140vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 60% 44% at 50% 10%, rgba(220,200,255,0.27) 0%, rgba(180,140,245,0.13) 30%, rgba(120,80,210,0.05) 60%, transparent 85%)',
        filter: 'blur(55px)',
        mixBlendMode: 'screen',
        animation: 'breathe 16s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute', top: '-38vmax', left: '50%',
        width: '420vmax', height: '420vmax',
        transform: 'translateX(-50%)',
        transformOrigin: '50% 0%',
        background: 'repeating-conic-gradient(from 90deg at 50% 0%, rgba(225,205,255,0.09) 0deg, rgba(225,205,255,0.03) 5deg, rgba(225,205,255,0.11) 10deg, rgba(225,205,255,0.02) 16deg, rgba(225,205,255,0.105) 22deg, rgba(225,205,255,0.035) 28deg, rgba(225,205,255,0.085) 35deg, rgba(225,205,255,0.025) 42deg, transparent 42.5deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 10%, black 0%, black 48%, rgba(0,0,0,0.38) 74%, transparent 94%)',
        maskImage: 'radial-gradient(circle at 50% 10%, black 0%, black 48%, rgba(0,0,0,0.38) 74%, transparent 94%)',
        filter: 'blur(20px) brightness(0.78)',
        mixBlendMode: 'screen',
        animation: 'shimmer1 36s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute', top: '-38vmax', left: '50%',
        width: '420vmax', height: '420vmax',
        transform: 'translateX(-50%)',
        transformOrigin: '50% 0%',
        background: 'repeating-conic-gradient(from 115deg at 50% 0%, transparent 0deg, rgba(210,180,255,0.08) 7deg, transparent 13deg, rgba(210,180,255,0.115) 19deg, transparent 25deg, rgba(210,180,255,0.06) 32deg, transparent 39deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 10%, black 0%, black 46%, rgba(0,0,0,0.4) 71%, transparent 92%)',
        maskImage: 'radial-gradient(circle at 50% 10%, black 0%, black 46%, rgba(0,0,0,0.4) 71%, transparent 92%)',
        filter: 'blur(24px) brightness(0.74)',
        mixBlendMode: 'screen',
        animation: 'shimmer2 44s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute', top: '-19vmax', left: '50%',
        width: '90vmax', height: '28vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(240,220,255,0.29) 0%, rgba(210,185,255,0.14) 42%, transparent 78%)',
        filter: 'blur(27px)',
        mixBlendMode: 'screen',
        animation: 'flicker 6s ease-in-out infinite',
      }} />

      <svg style={{
        position: 'absolute', inset: '-50%',
        width: '200%', height: '200%',
        opacity: 0.038,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}>
        <filter id="noiseFilterBg">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterBg)" />
      </svg>

      <div ref={moteRef} style={{ position: 'absolute', inset: 0 }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 72% at 50% 8%, transparent 22%, rgba(0,0,0,0.48) 55%, #010103 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
