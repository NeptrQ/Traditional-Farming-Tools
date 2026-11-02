'use client';
import { useEffect, useRef } from 'react';

export default function AtmosphereCanvas() {
  const canvasRef = useRef(null);
  const lanternRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouse = { x: width / 2, y: height / 2 };
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (lanternRef.current) {
        lanternRef.current.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 40 particles across 3 depth planes
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const depth = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: depth,
        size: depth === 1 ? 1.2 : depth === 2 ? 2.2 : 3.4,
        alpha: depth === 1 ? 0.25 : depth === 2 ? 0.55 : 0.85,
        speedY: (0.3 + depth * 0.25) * (Math.random() * 0.5 + 0.8),
        speedX: (Math.random() - 0.5) * 0.35,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
        color: depth === 3 ? '#F59E0B' : depth === 2 ? '#EA580C' : '#D97706'
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      scrollVelocity *= 0.92;

      for (let p of particles) {
        p.y -= p.speedY;
        p.y -= scrollVelocity * 0.08 * p.depth;
        p.swayAngle += p.swaySpeed;
        p.x += Math.sin(p.swayAngle) * (0.4 * p.depth) + p.speedX;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (1 - dist / 180) * 0.8 * (p.depth / 2);
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.depth === 3) {
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
        } else if (p.depth === 2) {
          ctx.shadowColor = '#EA580C';
          ctx.shadowBlur = 4;
          ctx.fillStyle = `rgba(234, 88, 12, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(217, 119, 6, ${p.alpha})`;
        }

        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        ref={lanternRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 0,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          filter: 'blur(130px)',
          opacity: 0.12,
          background: 'radial-gradient(circle, #EA580C 0%, transparent 70%)',
          top: 0,
          left: 0,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.1s ease-out'
        }}
      />
    </>
  );
}
