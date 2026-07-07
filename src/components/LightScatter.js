import React, { useMemo } from 'react';

const GLOWS = [
  { x: 50, y: 14, w: 600, h: 380, o: 0.16, c: '124,58,237', dur: 5, rx: 10, ry: 8 },
  { x: 30, y: 40, w: 400, h: 300, o: 0.06, c: '124,58,237', dur: 7, rx: -14, ry: -11 },
  { x: 70, y: 55, w: 350, h: 250, o: 0.05, c: '6,182,212', dur: 9, rx: 18, ry: -6 },
  { x: 20, y: 70, w: 300, h: 200, o: 0.04, c: '139,92,246', dur: 6, rx: -12, ry: 14 },
];

const PARTICLE_COUNT = 30;

export default function LightScatter() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i, x: Math.random() * 100, size: 0.8 + Math.random() * 2,
      delay: Math.random() * 25, duration: 15 + Math.random() * 25,
      driftX: -20 + Math.random() * 40,
    })),
  [],
  );

  const styleTag = useMemo(() => {
    let css = `
      @keyframes floatUp {
        0%   { transform: translateY(0) scale(1); opacity: 0; }
        15%  { opacity: 0.4; }
        85%  { opacity: 0.4; }
        100% { transform: translateY(-110vh) scale(0.2); opacity: 0; }
      }
    `;
    GLOWS.forEach((g, i) => {
      css += `
        @keyframes breathe${i} { 0%,100% { opacity: ${g.o}; } 50% { opacity: ${g.o + 0.04}; } }
        @keyframes wander${i} {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(${g.rx}px,${-g.ry}px); }
          50% { transform: translate(${-g.rx}px,${g.ry}px); }
          75% { transform: translate(${g.rx}px,${g.ry}px); }
        }
      `;
    });
    return css;
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{styleTag}</style>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #000 0%, #04070e 35%, #060b15 65%, #02050a 100%)',
      }} />

      {GLOWS.map((g, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse ${g.w}px ${g.h}px at ${g.x}% ${g.y}%, rgba(${g.c},${g.o}), transparent 70%)`,
          animation: `breathe${i} ${g.dur}s ease-in-out infinite, wander${i} ${g.dur + 6}s ease-in-out infinite`,
        }} />
      ))}

      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, bottom: '-8px',
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.id % 3 === 0 ? 'rgba(124,58,237,0.35)' : p.id % 3 === 1 ? 'rgba(167,139,250,0.25)' : 'rgba(6,182,212,0.2)',
          animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
          transform: `translateX(${p.driftX}px)`,
        }} />
      ))}
    </div>
  );
}
