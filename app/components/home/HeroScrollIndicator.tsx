"use client";

import { useEffect, useRef, useState } from "react";

export function HeroScrollIndicator() {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500"
      style={{ opacity: visible ? 0.5 : 0 }}
    >
      <svg
        className="w-6 h-6 text-[#F5F0EB] animate-bounce"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
