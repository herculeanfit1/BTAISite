"use client";

import { useEffect, useRef } from "react";

const ORB_CONFIG = [
  {
    size: 500,
    gradient: "radial-gradient(circle, rgba(122, 206, 193, 0.35), transparent 70%)",
    animation: "hero-float-1 20s ease-in-out infinite",
    delay: "0s",
    position: { top: "-10%", left: "10%" },
  },
  {
    size: 450,
    gradient: "radial-gradient(circle, rgba(212, 149, 107, 0.3), transparent 70%)",
    animation: "hero-float-2 25s ease-in-out infinite",
    delay: "-7s",
    position: { top: "30%", right: "-5%" },
  },
  {
    size: 550,
    gradient: "radial-gradient(circle, rgba(91, 144, 176, 0.3), transparent 70%)",
    animation: "hero-float-3 30s ease-in-out infinite",
    delay: "-14s",
    position: { bottom: "-15%", left: "40%" },
  },
];

function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; r: number; color: string; opacity: number }[]
  >([]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#D4956B", "#7ECEC1", "#5B90B0"];
    particlesRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.2 + 0.1,
    }));

    if (reducedMotion) {
      // Static render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return () => window.removeEventListener("resize", resize);
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Subtle connection lines between nearby particles
      particles.forEach((pA, idx) => {
        for (let j = idx + 1; j < particles.length; j++) {
          const pB = particles[j]; // eslint-disable-line security/detect-object-injection
          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.strokeStyle = "#5B90B0";
            ctx.globalAlpha = 0.08 * (1 - dist / 120);
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-0 animate-[fadeIn_1s_ease_0.5s_forwards]"
    />
  );
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Layer 1: Aurora gradient */}
      <div className="absolute inset-0 hero-aurora" />

      {/* Layer 2: Floating orbs */}
      {ORB_CONFIG.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.gradient,
            filter: "blur(80px)",
            animation: orb.animation,
            animationDelay: orb.delay,
            ...orb.position,
          }}
        />
      ))}

      {/* Layer 3: Canvas particles */}
      <AmbientParticles />
    </div>
  );
}
