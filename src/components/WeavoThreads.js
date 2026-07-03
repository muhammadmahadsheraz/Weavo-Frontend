import { useEffect, useRef } from 'react';

const PALETTE = [
  { r: 210, g: 160, b: 255 },
  { r: 190, g: 120, b: 255 },
  { r: 220, g: 180, b: 255 },
  { r: 175, g: 100, b: 255 },
  { r: 200, g: 140, b: 255 },
];
const WHITE = { r: 240, g: 220, b: 255 };

function rgba(c, a) {
  return `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
function rand(a, b) { return a + Math.random() * (b - a); }

function pointOnEdge(edge, W, H) {
  switch (edge) {
    case 'left':   return { x: -60,    y: rand(0.05, 0.95) * H };
    case 'right':  return { x: W + 60, y: rand(0.05, 0.95) * H };
    case 'top':    return { x: rand(0.05, 0.95) * W, y: -60    };
    case 'bottom': return { x: rand(0.05, 0.95) * W, y: H + 60 };
    default:       return { x: 0, y: 0 };
  }
}

function makeThread(W, H, index) {
  const edges = ['left', 'top', 'right', 'bottom'];
  const p0    = pointOnEdge(edges[index % 4],       W, H);
  const p3    = pointOnEdge(edges[(index + 2) % 4], W, H);
  const cp1   = { x: rand(0.1, 0.9) * W, y: rand(0.05, 0.45) * H };
  const cp2   = { x: rand(0.1, 0.9) * W, y: rand(0.55, 0.95) * H };
  const glowLen = rand(0.25, 0.40);
  return {
    p0, p3, cp1, cp2,
    color:    PALETTE[index % PALETTE.length],
    // Longer base period for slower, smoother motion
    period:   rand(12, 28),
    phaseOff: Math.random(),
    glowLen,
    // Total loop length: thread [0→1] + tail overshoot so tail fully exits
    // before head re-enters. Loop range = 1 + glowLen + fade margins.
    // Increase overshoot margin so the tail has plenty of room to exit
    // the visible span before the head loops back in.
    loopLen:  1 + glowLen + 0.6,
    coreW:    rand(0.25, 0.50),
  };
}

/* Only add stops that fall within (0, 1) — but DON'T anchor 0/1 as
   transparent here, we handle boundary fading via the stop alphas */
function buildGrad(ctx, p0, p3, rawStops, color) {
  let g;
  try { g = ctx.createLinearGradient(p0.x, p0.y, p3.x, p3.y); }
  catch (e) { return null; }

  // Transparent anchors so regions outside the glow zone are invisible
  g.addColorStop(0,   rgba(color, 0));
  g.addColorStop(1,   rgba(color, 0));

  const valid = rawStops
    .filter(s => s.pos > 0.0005 && s.pos < 0.9995)
    .sort((a, b) => a.pos - b.pos);

  let prev = -1;
  for (const s of valid) {
    if (s.pos - prev > 0.0005) {
      g.addColorStop(s.pos, rgba(color, s.a));
      prev = s.pos;
    }
  }
  return g;
}

const PASSES = [
  { w: 26,  a: 0.025 },
  { w: 18,  a: 0.05  },
  { w: 11,  a: 0.10  },
  { w:  6,  a: 0.22  },
  { w:  3,  a: 0.45  },
  { w:  1.4, a: 0.80 },
];

function bezierPoint(p0, cp1, cp2, p3, u) {
  const iu = 1 - u;
  const x = (iu*iu*iu)*p0.x + 3*(iu*iu)*u*cp1.x + 3*iu*(u*u)*cp2.x + (u*u*u)*p3.x;
  const y = (iu*iu*iu)*p0.y + 3*(iu*iu)*u*cp1.y + 3*iu*(u*u)*cp2.y + (u*u*u)*p3.y;
  return { x, y };
}

function drawGlowAt(ctx, t, head, elapsed) {
  const { p0, p3, cp1, cp2, color, glowLen, coreW } = t;

  // All stop positions are in gradient space [0,1]
  // They may fall outside that range — buildGrad will filter them
  // This is intentional: the filtering IS the fade-out at boundaries
  // Tail and padding. Use larger margins (scaled by glowLen) so the
  // glow (including its tail) is not removed prematurely when near
  // the thread ends.
  const tail     = head - glowLen;
  const preTail  = tail  - Math.max(0.18, glowLen * 0.6);
  const postHead = head  + Math.max(0.12, glowLen * 0.25);

  const stops = (peak) => [
    { pos: preTail,              a: 0          },
    { pos: tail,                 a: 0.03       },
    { pos: tail + glowLen * 0.6, a: peak * 0.5 },
    { pos: head,                 a: peak       },
    { pos: postHead,             a: 0          },
  ];

  // If the tail has gone off the parametric [0,1] range we check if
  // the tail's physical point is outside the canvas bounds. If so,
  // start (or refresh) a small grace period during which we continue
  // drawing the glow even though gradient stops fall outside (0,1).
  const tailParam = tail;
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  if ((tailParam < 0 || tailParam > 1)) {
    const clamped = Math.max(0, Math.min(1, tailParam));
    const pt = bezierPoint(p0, cp1, cp2, p3, clamped);
    const MARGIN = 20; // px beyond screen considered off-screen
    if (pt.x < -MARGIN || pt.x > canvasW + MARGIN || pt.y < -MARGIN || pt.y > canvasH + MARGIN) {
      const GRACE = 0.8; // seconds to keep drawing after tail off-screen
      t._keepUntil = (elapsed || 0) + GRACE;
    }
  }

  // Build gradient normally. If buildGrad returns null (no valid
  // stops inside (0,1)) but we are inside the grace window, then
  // force-clamp stops into the valid range so the glow remains visible
  // at the edge until the grace period expires.
  let raw = stops(1.0);
  let gCore = buildGrad(ctx, p0, p3, raw, color);
  if (!gCore && t._keepUntil && (elapsed || 0) < t._keepUntil) {
    // clamp positions into (0.001, 0.999) to satisfy addColorStop
    const clampedStops = raw.map(s => ({ pos: Math.max(0.001, Math.min(0.999, s.pos)), a: s.a }));
    gCore = buildGrad(ctx, p0, p3, clampedStops, color);
  }
  if (!gCore) return;

  for (const pass of PASSES) {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
    ctx.strokeStyle = gCore;
    ctx.lineWidth   = pass.w;
    ctx.globalAlpha = pass.a;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  let rawW = stops(0.9);
  let gWhite = buildGrad(ctx, p0, p3, rawW, WHITE);
  if (!gWhite && t._keepUntil && (elapsed || 0) < t._keepUntil) {
    const clampedW = rawW.map(s => ({ pos: Math.max(0.001, Math.min(0.999, s.pos)), a: s.a }));
    gWhite = buildGrad(ctx, p0, p3, clampedW, WHITE);
  }
  if (gWhite) {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
    ctx.strokeStyle = gWhite;
    ctx.lineWidth   = coreW;
    ctx.globalAlpha = 1;
    ctx.stroke();
  }
}

function drawThread(ctx, t, elapsed) {
  const { p0, p3, cp1, cp2, color, period, phaseOff, loopLen, coreW } = t;

  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';

  // Base dim thread
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
  ctx.strokeStyle = rgba(color, 0.07);
  ctx.lineWidth   = coreW + 1;
  ctx.stroke();

  // head travels from 0 → loopLen, then loops
  // loopLen > 1 so the glow's TAIL has fully exited before head re-enters
  const rawT = ((elapsed / period) + phaseOff) % 1.0;
  // Smooth the motion with an ease-in-out so the glow moves gently
  // rather than at a constant linear rate.
  const easeInOut = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);
  const easedT = easeInOut(rawT);
  const head  = easedT * loopLen; // scale eased 0→1 to 0→loopLen

  // Primary glow position (pass elapsed so grace logic works)
  drawGlowAt(ctx, t, head, elapsed);

  // Wrap-around: when head is near loopLen (about to reset),
  // simultaneously show the glow re-entering from position 0
  // by drawing it at head - loopLen (which puts it at the start)
  drawGlowAt(ctx, t, head - loopLen, elapsed);
}

const THREAD_COUNT = 16;

export default function WeavoThreads() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId, startTs = null;
    let threads = [];

    const build = () => {
      threads = Array.from({ length: THREAD_COUNT }, (_, i) =>
        makeThread(window.innerWidth, window.innerHeight, i)
      );
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      build();
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (ts) => {
      if (!startTs) startTs = ts;
      const elapsed = (ts - startTs) / 1000;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      threads.forEach(t => drawThread(ctx, t, elapsed));
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
