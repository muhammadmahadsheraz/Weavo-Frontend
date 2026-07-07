import React, { useMemo } from 'react';

const PARTICLE_COUNT = 40;

export default function LightScatter() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 20,
      duration: 12 + Math.random() * 20,
      drift: -15 + Math.random() * 30,
    })),
  []);

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    }}>
      <style>{`
        @keyframes raySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes particleDrift {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.5; }
          100% { transform: translate(var(--drift), -110vh) scale(0.3); opacity: 0; }
        }
      `}</style>

      {/* Deep ocean gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #000 0%, #04070e 35%, #060b15 65%, #02050a 100%)',
      }} />

      {/* Central light glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 550px 350px at 50% 160px, rgba(124,58,237,0.18), transparent 70%)',
        animation: 'glowPulse 8s ease-in-out infinite',
      }} />

      {/* Light rays — conic gradient slowly spinning */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(124,58,237,0.04) 6deg, transparent 14deg, transparent 36deg, rgba(124,58,237,0.035) 42deg, transparent 50deg, transparent 72deg, rgba(6,182,212,0.025) 78deg, transparent 86deg, transparent 108deg, rgba(124,58,237,0.04) 114deg, transparent 122deg, transparent 144deg, rgba(124,58,237,0.03) 150deg, transparent 158deg, transparent 180deg, rgba(6,182,212,0.02) 186deg, transparent 194deg, transparent 216deg, rgba(124,58,237,0.035) 222deg, transparent 230deg, transparent 252deg, rgba(124,58,237,0.04) 258deg, transparent 266deg, transparent 288deg, rgba(6,182,212,0.025) 294deg, transparent 302deg, transparent 324deg, rgba(124,58,237,0.03) 330deg, transparent 338deg)',
        WebkitMask: 'radial-gradient(ellipse 800px 500px at 50% 180px, black, transparent 65%)',
        mask: 'radial-gradient(ellipse 800px 500px at 50% 180px, black, transparent 65%)',
        animation: 'raySpin 40s linear infinite',
        transformOrigin: '50% 180px',
      }} />

      {/* Floating light particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, bottom: '-10px',
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: p.id % 3 === 0 ? 'rgba(124,58,237,0.5)' : p.id % 3 === 1 ? 'rgba(167,139,250,0.4)' : 'rgba(6,182,212,0.3)',
          boxShadow: `0 0 ${p.size * 2}px ${p.size}px ${p.id % 3 === 0 ? 'rgba(124,58,237,0.15)' : 'rgba(167,139,250,0.1)'}`,
          '--drift': `${p.drift}px`,
          animation: `particleDrift ${p.duration}s ${p.delay}s linear infinite`,
        } } />
      ))}
    </div>
  );
}
