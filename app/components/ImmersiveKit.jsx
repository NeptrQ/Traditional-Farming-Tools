'use client';

/**
 * ImmersiveKit: three effects, pure React + vanilla JS, no packages.
 *
 *   <SpotlightGrid>      a light that follows the cursor across a group of cards
 *   <ScrollCarousel>     swipe / drag / arrow-button carousel with snap + progress
 *   <HorizontalScroll>   scrolling down moves the page sideways (pinned section)
 *
 * Setup:
 *   1. Save this file as app/components/ImmersiveKit.jsx
 *   2. Save immersive.css next to it and import it once in app/layout.js:
 *        import './components/immersive.css';
 *   3. Do NOT put overflow-x: hidden on html/body (it breaks position: sticky).
 *      If you need to hide sideways overflow, use overflow-x: clip instead.
 */

import { Children, useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* 1. SpotlightGrid                                                    */
/* ------------------------------------------------------------------ */
/**
 * Usage:
 *   <SpotlightGrid className="my-grid">
 *     <article className="spot-card">...</article>
 *     <article className="spot-card">...</article>
 *   </SpotlightGrid>
 * Any element with class "spot-card" inside the grid gets the glow, and the
 * light flows across neighbouring cards as the cursor moves.
 */
export function SpotlightGrid({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Touch screens have no cursor, so skip.
    if (!window.matchMedia('(hover: hover)').matches) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    const paint = () => {
      raf = 0;
      el.querySelectorAll('.spot-card').forEach((card) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${lastX - r.left}px`);
        card.style.setProperty('--my', `${lastY - r.top}px`);
      });
    };
    const onMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      el.classList.add('is-lit');
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => el.classList.remove('is-lit');

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={`spot-grid ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. ScrollCarousel                                                   */
/* ------------------------------------------------------------------ */
/**
 * Usage:
 *   <ScrollCarousel label="Stories from my grandparents">
 *     <StoryCard ... />
 *     <StoryCard ... />
 *   </ScrollCarousel>
 * Each child is wrapped in a snap item automatically.
 */
export function ScrollCarousel({ children, label = 'Carousel' }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const progressRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    const start = el.scrollLeft <= 2;
    const end = max <= 0 || el.scrollLeft >= max - 2;

    if (progressRef.current) progressRef.current.style.transform = `scaleX(${0.12 + 0.88 * p})`;
    if (prevBtnRef.current) prevBtnRef.current.disabled = start;
    if (nextBtnRef.current) nextBtnRef.current.disabled = end;
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();

    // Mark the item that is mostly in view so CSS can highlight it.
    const items = el.querySelectorAll('.carousel-item');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          en.target.dataset.active = en.intersectionRatio >= 0.6 ? 'true' : 'false';
        }),
      { root: el, threshold: [0, 0.6, 1] }
    );
    items.forEach((it) => io.observe(it));

    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      io.disconnect();
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const step = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const item = el.querySelector('.carousel-item');
    const amount = item ? item.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * amount, behavior: reduce ? 'auto' : 'smooth' });
  };

  // Mouse drag (touch already scrolls natively).
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: 0 };
    el.style.scrollSnapType = 'none';
    el.classList.add('is-dragging');
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const el = trackRef.current;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    el.scrollLeft = d.startScroll - dx;
  };
  const endDrag = () => {
    const el = trackRef.current;
    if (!drag.current.active || !el) return;
    drag.current.active = false;
    el.style.scrollSnapType = '';
    el.classList.remove('is-dragging');
  };
  // If the pointer moved, swallow the click so dragging a card does not open it.
  const onClickCapture = (e) => {
    if (drag.current.moved > 5) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <section className="carousel" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        className="carousel-track"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {Children.map(children, (child) => (
          <div className="carousel-item" data-active="false">
            {child}
          </div>
        ))}
      </div>

      <div className="carousel-controls">
        <div className="carousel-bar" aria-hidden="true">
          <span ref={progressRef} style={{ transform: `scaleX(0.12)` }} />
        </div>
        <button
          ref={prevBtnRef}
          type="button"
          className="carousel-btn focus-ring"
          onClick={() => step(-1)}
          aria-label="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          ref={nextBtnRef}
          type="button"
          className="carousel-btn focus-ring"
          onClick={() => step(1)}
          aria-label="Next"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. HorizontalScroll                                                 */
/* ------------------------------------------------------------------ */
/**
 * Usage:
 *   <HorizontalScroll label="A year in the rice field">
 *     <div className="hscroll-panel"> ... </div>
 *     <div className="hscroll-panel"> ... </div>
 *   </HorizontalScroll>
 *
 * The section pins to the screen while the visitor scrolls down, and the
 * panels slide sideways. The panel nearest the centre is bright and larger,
 * the others dim (CSS variable --focus, 0 to 1). Anything inside a panel with
 * data-depth="0.5" (any number) drifts at a different speed for parallax.
 *
 * On phones (under 768px) or with reduced motion it becomes a normal
 * swipeable row instead, so nothing is lost.
 */
export function HorizontalScroll({ children, label }) {
  return (
    <section aria-label={label} style={{ 
      padding: 'var(--space-64) 24px', 
      display: 'flex', 
      flexDirection: 'row', 
      gap: '32px', 
      alignItems: 'stretch',
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none'
    }}>
      {children}
    </section>
  );
}
