'use client';

/**
 * AuroraBackground
 * ----------------
 * Flowing, glowing ribbons of light behind the whole site, like the video.
 * - Pure HTML canvas + vanilla JS. No packages.
 * - Reacts to scroll: the ribbons move, twist and change colour as the visitor
 *   moves down the page, so each section feels different.
 * - Reduced motion: draws one still frame and stops animating.
 *
 * HOW TO USE (Next.js App Router)
 *   1. Save as app/components/AuroraBackground.jsx
 *   2. In app/layout.js:   <body> <AuroraBackground /> <div className="site">{children}</div> </body>
 *   3. In globals.css:     body { background: #14100D; }
 *                          .site { position: relative; z-index: 1; }
 */

import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;

// Each bundle is a group of thin lines that fan out and cross each other,
// which is what creates the silky "ribbon" look. Colours are RGB.
const BUNDLES = [
  { color: [232, 176, 74], lines: 6, freq: 1.1, speed: 0.2 }, // straw gold
  { color: [200, 85, 61], lines: 5, freq: 1.6, speed: 0.15 },  // ember clay
  { color: [255, 222, 160], lines: 4, freq: 0.8, speed: 0.1 }, // pale straw
];

const STEPS = 20; // Drastically lower steps for very little math per frame

/**
 * Draws one frame.
 * t  = time in seconds (drives the slow constant drift)
 * sp = scroll progress 0..1 (drives the big shape changes between sections)
 */
export function drawAurora(ctx, W, H, t, sp) {
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; // overlapping lines add up to a glow

  BUNDLES.forEach((b, bi) => {
    // How strongly this bundle shows at the current scroll position.
    const weight = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(sp * TAU * 1.3 + bi * 2.1));
    // Where the bundle sits vertically, how tall the waves are, how tight, how twisted.
    const cy = H * (0.5 + 0.2 * Math.sin(sp * TAU + bi * 2.1));
    const amp = H * (0.17 + 0.07 * Math.cos(sp * TAU * 1.5 + bi));
    const freq = b.freq + 0.5 * Math.sin(sp * TAU * 0.8 + bi);
    const twist = 2.5 + 2 * Math.sin(sp * TAU * 1.1 + bi * 1.3);
    const phase = t * b.speed;

    // A bright "hot spot" that slowly slides sideways; the line fades out at both ends.
    const hot = 0.5 + 0.3 * Math.sin(t * 0.1 + bi * 1.7 + sp * TAU);
    const [r, g, bl] = b.color;
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, `rgba(${r},${g},${bl},0)`);
    grad.addColorStop(Math.max(0.05, hot - 0.35), `rgba(${r},${g},${bl},0.25)`);
    grad.addColorStop(hot, `rgba(${r},${g},${bl},1)`);
    grad.addColorStop(Math.min(0.95, hot + 0.35), `rgba(${r},${g},${bl},0.25)`);
    grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
    ctx.strokeStyle = grad;

    // Soft haze under the ribbons, centred on the hot spot (the diffuse glow in the video).
    const haze = ctx.createRadialGradient(hot * W, cy, 0, hot * W, cy, H * 0.75);
    haze.addColorStop(0, `rgba(${r},${g},${bl},${(0.16 * weight).toFixed(3)})`);
    haze.addColorStop(1, `rgba(${r},${g},${bl},0)`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < b.lines; i++) {
      const k = i / (b.lines - 1) - 0.5; // -0.5 .. 0.5, position inside the bundle
      ctx.beginPath();
      for (let s = 0; s <= STEPS; s++) {
        const x = (s / STEPS) * W;
        const u = (x / W) * TAU;
        const y =
          cy +
          k * amp * 1.1 +
          amp *
            (0.65 * Math.sin(u * freq + phase + k * twist) +
              0.35 * Math.sin(u * freq * 1.9 - phase * 0.8 + k * twist * 1.7 + bi));
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Soft wide stroke = glow, thin stroke = the crisp silky line.
      ctx.globalAlpha = weight * 0.25; // Boosted due to fewer lines
      ctx.lineWidth = 12; // Thicker glow
      ctx.stroke();
      ctx.globalAlpha = weight * 0.85; // Boosted core line
      ctx.lineWidth = 2; // Thicker core line
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export default function AuroraBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0;
    let H = 0;
    let raf = 0;
    let target = 0; // real scroll progress
    let sp = 0; // smoothed scroll progress (eases toward target)
    const start = performance.now();

    const resize = () => {
      const dpr = 1; // Cap to 1 for performance
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    let scrollTimer = null;
    let isScrolling = false;

    const frame = (now) => {
      if (!isScrolling) {
        sp += (target - sp) * 0.06; // smooth, never jumps
        drawAurora(ctx, W, H, (now - start) / 1000, sp);
      } else {
        sp = target;
      }
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      readScroll();
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { isScrolling = false; }, 150);
      
      if (reduceMotion) {
        sp = target;
        drawAurora(ctx, W, H, 0, sp);
      }
    };

    const onResize = () => {
      resize();
      readScroll();
      if (reduceMotion) drawAurora(ctx, W, H, 0, sp);
    };

    resize();
    readScroll();
    sp = target;

    if (reduceMotion) {
      drawAurora(ctx, W, H, 0, sp); // one still frame
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      {/* Dark vignette so text stays readable over the glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(20,16,13,0) 0%, rgba(20,16,13,0.6) 100%)',
        }}
      />
    </>
  );
}
