"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface VercelInspiredAnimationProps {
  width?: number;
  height?: number;
}

/**
 * VercelInspiredAnimation Component
 *
 * Creates a Vercel-like animation with colorful rays, a logo in the center, and a grid background.
 * Uses canvas for performance and supports responsive sizing.
 * Now includes hover effects for interactivity.
 */
export const VercelInspiredAnimation: React.FC<
  VercelInspiredAnimationProps
> = ({ width = 800, height = 500 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // Colors for the rays, ranging from blue to lighter shades for BTAI theme
  const rayColors = [
    "#1e3a8a", // Dark blue
    "#3b82f6", // Blue
    "#5B90B0", // Brand blue
    "#60a5fa", // Light blue
    "#93c5fd", // Lighter blue
    "#bfdbfe", // Very light blue
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to correct size
    canvas.width = width;
    canvas.height = height;

    // Center of the canvas
    const centerX = width / 2;
    const centerY = height / 2;

    // Grid properties
    const gridSpacing = 20;
    const gridOpacity = isHovered ? 0.25 : 0.15; // Brighter grid on hover

    // Ray properties
    const rayCount = 12;
    // Longer rays when hovered
    const maxRayLength = Math.max(width, height) * (isHovered ? 0.8 : 0.7);

    // Animation timer
    const startTime = Date.now();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Calculate animation progress
      const now = Date.now();
      const elapsedMs = now - startTime;
      // Speed up animation when hovered
      const cycleSpeed = isHovered ? 7000 : 10000;
      const t = (elapsedMs % cycleSpeed) / cycleSpeed;

      // Draw grid background
      drawGrid(ctx, width, height, gridSpacing, gridOpacity);

      // Draw rays
      drawRays(ctx, centerX, centerY, rayCount, maxRayLength, t);

      // Draw logo center circle with glow
      drawLogoBackground(ctx, centerX, centerY, isHovered ? 55 : 50);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Draw the grid backdrop
    function drawGrid(
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      spacing: number,
      opacity: number
    ) {
      ctx.strokeStyle = `rgba(100, 150, 200, ${opacity})`;
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = spacing; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = spacing; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw colorful rays emanating from center
    function drawRays(
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      count: number,
      maxLength: number,
      time: number
    ) {
      for (let i = 0; i < count; i++) {
        // Calculate angle for this ray
        const angle = (i / count) * Math.PI * 2;

        // Offset angle by time for rotation effect
        const rotatedAngle = angle + time * Math.PI * 2;

        // Pulsing effect for ray length
        const pulseOffset = Math.sin(time * Math.PI * 2 + i * 0.5) * 0.2;
        // More pronounced pulsing when hovered
        const pulseMultiplier = isHovered ? 0.5 : 0.4;
        const rayLength = maxLength * (0.6 + pulseOffset * pulseMultiplier);

        // Calculate end point
        const endX = centerX + Math.cos(rotatedAngle) * rayLength;
        const endY = centerY + Math.sin(rotatedAngle) * rayLength;

        // Create gradient for ray
        const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY);

        // Get a color for this ray using a safer method
        const colorIndex = i % rayColors.length;
        // eslint-disable-next-line security/detect-object-injection -- colorIndex is modulo-bounded
        const color = rayColors[colorIndex] || rayColors[0];

        // Brighter middle section when hovered
        const midOpacity = isHovered ? "60" : "40";

        gradient.addColorStop(0, `${color}00`); // Transparent at center
        gradient.addColorStop(0.5, `${color}${midOpacity}`); // Semi-transparent in middle
        gradient.addColorStop(1, `${color}00`); // Transparent at end

        // Draw ray
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        // Wider rays when hovered
        const baseWidth = isHovered ? 20 : 15;
        ctx.lineWidth = baseWidth + Math.sin(time * Math.PI * 4 + i) * 5;
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }
    }

    // Draw circle background for logo
    function drawLogoBackground(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number
    ) {
      // Draw glow
      const glowGradient = ctx.createRadialGradient(
        x,
        y,
        radius * 0.8,
        x,
        y,
        radius * 1.5
      );
      // More intense glow when hovered
      const glowOpacity = isHovered ? "0.9" : "0.8";
      glowGradient.addColorStop(0, `rgba(91, 144, 176, ${glowOpacity})`); // Brand blue with opacity
      glowGradient.addColorStop(1, "rgba(91, 144, 176, 0)");

      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Draw solid background for logo with slight color change when hovered
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? "#f8faff" : "#ffffff";
      ctx.fill();

      // Draw subtle border, more pronounced when hovered
      const borderOpacity = isHovered ? "0.5" : "0.3";
      ctx.strokeStyle = `rgba(91, 144, 176, ${borderOpacity})`;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();
    }

    // Start the animation
    draw();

    // Cleanup function to cancel animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, rayColors, isHovered]); // Added isHovered to dependencies

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        cursor: "pointer",
        transition: "transform 0.3s ease",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          transition: "box-shadow 0.3s ease",
          boxShadow: isHovered
            ? "0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)"
            : "none",
        }}
        aria-label="Bridging Trust AI logo, surrounded by animated rays of blue light on a grid background"
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) ${isHovered ? "scale(1.1)" : "scale(1)"}`,
          zIndex: 1,
          width: 80,
          height: 80,
          transition: "transform 0.3s ease",
        }}
      >
        <Image
          src="/images/logo/BTAI_Logo_Round.svg"
          alt="Bridging Trust AI Logo"
          width={80}
          height={80}
          style={{
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};
