import { useEffect, useRef } from 'react';

/*
  Giant tilted helix drawn on a canvas that sits fixed behind the dashboard.
  
  The helix axis runs from bottom-left to top-right (~30° tilt).
  Two strands wind around that axis — purple dots on one strand,
  slightly dimmer violet on the other. Connecting lines are drawn
  between the two strands at regular intervals so it reads as a
  double-helix (DNA-style).

  Dots travel forward along the path continuously — when one
  reaches the end it wraps back to the start, creating the
  endless-loop feel. Depth (z in helix space) controls dot size
  and opacity so nearer dots look bigger and brighter.

  The canvas is position:fixed, z-index:0, pointer-events:none.
  Glass cards have z-index > 0 and their own backdrop-filter, so
  any dots that visually sit behind a card are blurred by the
  browser's compositor exactly as you described.
*/

const TWO_PI = Math.PI * 2;

// Helix parameters
const TOTAL_DOTS   = 90;        // dots per strand
const STRAND_PHASE = Math.PI;   // second strand is π out of phase
const WINDS        = 3.5;       // how many full rotations along the axis
const RADIUS_SCREEN_FRAC = 0.09; // helix radius as fraction of screen height
const SPEED        = 0.0004;    // loop speed (phase units per ms)
const DOT_MIN      = 2;
const DOT_MAX      = 5.5;
const CONNECTOR_EVERY = 6;      // draw a connector every N dots

// Helix axis: from (ax0·W, ay0·H) to (ax1·W, ay1·H)
const AXIS = { ax0: -0.05, ay0: 1.05, ax1: 1.05, ay1: -0.05 };

// Colours
const COLOR_A = { r: 139, g: 92,  b: 246 }; // violet-400
const COLOR_B = { r:  99, g: 102, b: 241 }; // indigo-500

function rgba(c, a) {
  return `rgba(${c.r},${c.g},${c.b},${a.toFixed(3)})`;
}

export default function HelixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;
    let lastTs = null;
    let phase  = 0; // global phase offset — advances every frame

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Compute a dot's (x, y, z) for a given helix parameter t ──
    // t  = position along the helix [0, WINDS * TWO_PI]
    // strand = 0 or 1  (adds STRAND_PHASE offset)
    function helixPoint(t, strand, W, H) {
      const axisX0 = AXIS.ax0 * W;
      const axisY0 = AXIS.ay0 * H;
      const axisX1 = AXIS.ax1 * W;
      const axisY1 = AXIS.ay1 * H;

      const axLen   = Math.hypot(axisX1 - axisX0, axisY1 - axisY0);
      const axDirX  = (axisX1 - axisX0) / axLen;
      const axDirY  = (axisY1 - axisY0) / axLen;

      // Perpendicular to axis (in 2-D screen plane) — this is the "x" of helix cross-section
      const perpX = -axDirY;
      const perpY =  axDirX;

      // "z" direction (depth) — perpendicular but also tilted into screen
      // We fake depth by using sin of the rotation angle.
      const tTotal   = WINDS * TWO_PI;
      const progress = t / tTotal;          // 0→1 along axis
      const angle    = t + strand * STRAND_PHASE + phase;
      const radius   = RADIUS_SCREEN_FRAC * H;

      const cx = axisX0 + axDirX * progress * axLen;
      const cy = axisY0 + axDirY * progress * axLen;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Project: perpendicular gives screen-x offset, sin gives depth (z)
      const sx = cx + perpX * cosA * radius;
      const sy = cy + perpY * cosA * radius;
      const z  = sinA; // -1 (back) to +1 (front)

      return { sx, sy, z, progress };
    }

    function draw(ts) {
      if (lastTs !== null) phase += (ts - lastTs) * SPEED;
      lastTs = ts;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const tTotal = WINDS * TWO_PI;
      const step   = tTotal / TOTAL_DOTS;

      // ── Build point arrays for both strands ──
      const strandA = [];
      const strandB = [];
      for (let i = 0; i < TOTAL_DOTS; i++) {
        const t = i * step;
        strandA.push(helixPoint(t, 0, W, H));
        strandB.push(helixPoint(t, 1, W, H));
      }

      // ── Draw connector lines (between strands) ──
      ctx.lineWidth = 0.6;
      for (let i = 0; i < TOTAL_DOTS; i += CONNECTOR_EVERY) {
        const a = strandA[i];
        const b = strandB[i];
        // Depth: average z, clamp opacity
        const z    = (a.z + b.z) * 0.5;
        const opac = Math.max(0, (z + 1) * 0.5) * 0.18 + 0.04;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(139,92,246,${opac.toFixed(3)})`;
        ctx.stroke();
      }

      // ── Draw strand curves ──
      const drawCurve = (pts, color) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i];
          const p1 = pts[i + 1];
          const z    = (p0.z + p1.z) * 0.5;
          const opac = Math.max(0, (z + 1) * 0.5) * 0.25 + 0.04;
          ctx.beginPath();
          ctx.moveTo(p0.sx, p0.sy);
          ctx.lineTo(p1.sx, p1.sy);
          ctx.strokeStyle = rgba(color, opac);
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      };
      drawCurve(strandA, COLOR_A);
      drawCurve(strandB, COLOR_B);

      // ── Draw dots ──
      const drawDots = (pts, color) => {
        pts.forEach(p => {
          // z ranges -1 → +1; map to size and opacity
          const t     = (p.z + 1) * 0.5;          // 0→1
          const r     = DOT_MIN + t * (DOT_MAX - DOT_MIN);
          const opac  = 0.12 + t * 0.72;
          const glow  = r * 3.5;

          // Soft glow halo
          const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, glow);
          grad.addColorStop(0,   rgba(color, opac * 0.55));
          grad.addColorStop(0.4, rgba(color, opac * 0.18));
          grad.addColorStop(1,   rgba(color, 0));
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, glow, 0, TWO_PI);
          ctx.fillStyle = grad;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r, 0, TWO_PI);
          ctx.fillStyle = rgba(color, opac);
          ctx.fill();
        });
      };

      // Draw back-facing dots first, then front-facing (painter's algorithm)
      const allA = [...strandA].sort((a, b) => a.z - b.z);
      const allB = [...strandB].sort((a, b) => a.z - b.z);
      drawDots(allB, COLOR_B);
      drawDots(allA, COLOR_A);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 1,
      }}
    />
  );
}
