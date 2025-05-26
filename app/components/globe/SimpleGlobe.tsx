"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import {
  createScene,
  createCamera,
  createRenderer,
  createSphere,
  createGrid,
  createLighting,
  type GlobeConfig,
} from "./GlobeCore";
import { createArcs, createTracerLines, animateTracers } from "./GlobeAnimations";

interface SimpleGlobeProps {
  color?: string;
  wireframe?: boolean;
  rotation?: number;
  gridOpacity?: number;
}

/**
 * SimpleGlobe component - A WebGL-powered 3D globe with animations
 * Refactored to follow cursor rules (under 150 lines)
 */
export const SimpleGlobe: React.FC<SimpleGlobeProps> = ({
  color = "#6366f1",
  wireframe = true,
  rotation = 0.001,
  gridOpacity = 0.6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);

    // Don't initialize Three.js until component is mounted
    if (!mounted || !containerRef.current) return;

    const config: GlobeConfig = {
      color,
      wireframe,
      rotation,
      gridOpacity,
      isDarkMode,
    };

    // Initialize Three.js scene
    const scene = createScene(isDarkMode);
    const camera = createCamera();
    const renderer = createRenderer(containerRef.current);

    // Clear container and add renderer
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const lights = createLighting();
    lights.forEach((light) => scene.add(light));

    // Create globe elements
    const sphere = createSphere(config);
    const grid = createGrid(config);
    const arcsGroup = createArcs(color);
    const tracerGroup = createTracerLines();

    // Add to scene
    scene.add(sphere);
    scene.add(grid);
    scene.add(arcsGroup);
    scene.add(tracerGroup);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate globe
      sphere.rotation.y += rotation;
      grid.rotation.y += rotation;

      // Animate tracers
      animateTracers(tracerGroup);

      // Render
      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Start animation and add listeners
    animate();
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      
      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mounted, color, wireframe, rotation, gridOpacity, isDarkMode]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] relative"
      style={{ background: "transparent" }}
    />
  );
};

export default SimpleGlobe;
