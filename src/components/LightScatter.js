import React, { useRef, useEffect } from 'react';

const RAY_COUNT = 7;
const PARTICLE_COUNT = 60;

export default function LightScatter() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    const apexX = W * 0.5;
    const apexY = H * -0.12;

    const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
      const t = RAY_COUNT <= 1 ? 0 : i / (RAY_COUNT - 1);
      return {
        angleCenter: (t - 0.5) * 1.2,
        halfWidth: 0.04 + Math.random() * 0.06,
        speed: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        amp: 0.06 + Math.random() * 0.10,
        brightness: 0.55 + Math.random() * 0.45,
      };
    });

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1.5 + Math.random() * 3,
      speed: 0.0015 + Math.random() * 0.004,
      drift: -0.004 + Math.random() * 0.008,
    }));

    let time = 0;
    const PI = Math.PI;
    const HALF_PI = PI / 2;

    const draw = () => {
      time += 1 / 60;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      // ── Draw rays ──
      for (const ray of rays) {
        const angle = ray.angleCenter + Math.sin(time * ray.speed + ray.phase) * ray.amp;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const steps = 80;
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const dist = t * Math.hypot(W, H) * 1.5;
          const px = apexX + dist * sinA;
          const py = apexY + dist * cosA;

          const halfAng = ray.halfWidth * (1 + t * 1.2);
          const span = dist * Math.tan(halfAng);
          const brightness = ray.brightness * (1 - t * 0.4) * 0.30;

          const grad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(span * 2, 8));
          grad.addColorStop(0, `rgba(225,212,255,${brightness})`);
          grad.addColorStop(0.5, `rgba(200,185,255,${brightness * 0.5})`);
          grad.addColorStop(1, 'rgba(180,160,240,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(px, py, Math.max(span * 1.5, 2), Math.max(span, 2), angle + HALF_PI, 0, PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      // ── Draw particles ──
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
          p.drift = -0.003 + Math.random() * 0.006;
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        const px = p.x * W;
        const py = p.y * H;

        // Check ray intersection
        const dx = px - apexX;
        const dy = py - apexY;
        const dist = Math.hypot(dx, dy);
        const pAngle = Math.atan2(dx, dy);

        let maxIntensity = 0;
        let bestRay = null;

        for (const ray of rays) {
          const rayAngle = ray.angleCenter + Math.sin(time * ray.speed + ray.phase) * ray.amp;
          const diff = Math.abs(pAngle - rayAngle);
          const wrapped = Math.min(diff, PI * 2 - diff);
          const halfAng = ray.halfWidth * (1 + (dist / Math.hypot(W, H)) * 0.6);
          if (wrapped < halfAng) {
            const intensity = (1 - wrapped / halfAng) * ray.brightness;
            if (intensity > maxIntensity) {
              maxIntensity = intensity;
              bestRay = ray;
            }
          }
        }

        const falloff = Math.max(0, 1 - (dist / Math.hypot(W, H)) * 0.4);
        const brightness = maxIntensity * falloff;

        if (brightness > 0.01) {
          const glow = brightness * 0.7;
          const size = p.size * (1 + brightness * 0.6);

          // White core
          ctx.beginPath();
          ctx.arc(px, py, size * 0.4, 0, PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${Math.min(brightness * 0.85, 0.75)})`;
          ctx.fill();

          // Lavender inner glow
          ctx.beginPath();
          ctx.arc(px, py, size * 0.8, 0, PI * 2);
          ctx.fillStyle = `rgba(230,220,255,${Math.min(glow, 0.5)})`;
          ctx.fill();

          // Outer bloom
          ctx.beginPath();
          ctx.arc(px, py, size * 3, 0, PI * 2);
          ctx.fillStyle = `rgba(210,195,250,${Math.min(glow * 0.3, 0.2)})`;
          ctx.fill();

          // Soft haze
          ctx.beginPath();
          ctx.arc(px, py, size * 6, 0, PI * 2);
          ctx.fillStyle = `rgba(220,210,255,${Math.min(glow * 0.12, 0.08)})`;
          ctx.fill();
        } else {
          // barely visible when outside beams
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.4, 0, PI * 2);
          ctx.fillStyle = 'rgba(200,185,240,0.06)';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes ambientBreathe { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        @keyframes surfaceFlicker { 0%,100% { opacity: 0.85; } 45% { opacity: 1; } 50% { opacity: 0.65; } 55% { opacity: 0.95; } }
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
        background: 'radial-gradient(ellipse 46% 32% at 50% 0%, rgba(220,210,250,0.40) 0%, rgba(190,175,245,0.20) 28%, rgba(150,135,220,0.08) 50%, transparent 72%)',
        filter: 'blur(42px)', mixBlendMode: 'screen',
        animation: 'ambientBreathe 10s ease-in-out infinite',
      }} />

      {/* Surface brightening */}
      <div style={{
        position: 'absolute', top: '-16vmax', left: '50%',
        width: '70vmax', height: '20vmax',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse 55% 45% at 50% 100%, rgba(220,210,250,0.22) 0%, rgba(6,182,212,0.08) 45%, transparent 78%)',
        filter: 'blur(24px)', mixBlendMode: 'screen',
        animation: 'surfaceFlicker 4.5s ease-in-out infinite',
      }} />

      {/* Canvas — rays + particles */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        mixBlendMode: 'screen',
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
    </div>
  );
}
