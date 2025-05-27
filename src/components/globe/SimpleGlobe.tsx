"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface SimpleGlobeProps {
  color?: string;
  wireframe?: boolean;
  rotation?: number;
  gridOpacity?: number;
}

export const SimpleGlobe: React.FC<SimpleGlobeProps> = ({
  color = "#6366f1",
  wireframe = true,
  rotation = 0.001,
  gridOpacity = 0.6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (containerRef.current && rendererRef.current.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current = null;
    }

    sceneRef.current = null;
  }, []);

  // Function to generate random point on sphere
  const randomPointOnSphere = useCallback(() => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    return new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    );
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Add a small delay to ensure container is properly sized
    const initTimer = setTimeout(() => {
      try {
        const container = containerRef.current;
        if (!container) return;

        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width || 400;
        const height = containerRect.height || 400;

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? "#050714" : "#0a0f2d");
        sceneRef.current = scene;

        // Create camera with proper aspect ratio
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 2.5;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        rendererRef.current = renderer;

        // Clear container and add renderer
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        container.appendChild(renderer.domElement);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Create the main sphere
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({
          color: color,
          wireframe: wireframe,
          transparent: true,
          opacity: 0.7,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // Create grid lines (graticules)
        const gridGeometry = new THREE.SphereGeometry(1.01, 16, 16);
        const gridMaterial = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: gridOpacity,
        });
        const grid = new THREE.LineSegments(
          new THREE.WireframeGeometry(gridGeometry),
          gridMaterial
        );
        scene.add(grid);

        // Create animated tracer lines
        const tracerGroup = new THREE.Group();
        scene.add(tracerGroup);

        // Create longitude tracers (vertical circles)
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          const points = [];

          for (let j = 0; j <= 64; j++) {
            const phi = (j / 64) * Math.PI * 2 - Math.PI / 2;
            points.push(
              new THREE.Vector3(
                1.02 * Math.cos(angle) * Math.cos(phi),
                1.02 * Math.sin(phi),
                1.02 * Math.sin(angle) * Math.cos(phi)
              )
            );
          }

          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: "#ff6b6b",
            transparent: true,
            opacity: 0.8,
          });

          const line = new THREE.Line(geometry, material);
          line.userData = {
            originalPoints: points,
            offset: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.01,
          };
          tracerGroup.add(line);
        }

        // Create latitude tracers (horizontal circles)
        for (let i = 0; i < 3; i++) {
          const phi = ((i - 1) / 2) * Math.PI * 0.6; // Spread across latitudes
          const points = [];

          for (let j = 0; j <= 64; j++) {
            const theta = (j / 64) * Math.PI * 2;
            points.push(
              new THREE.Vector3(
                1.02 * Math.cos(theta) * Math.cos(phi),
                1.02 * Math.sin(phi),
                1.02 * Math.sin(theta) * Math.cos(phi)
              )
            );
          }

          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: "#4ecdc4",
            transparent: true,
            opacity: 0.8,
          });

          const line = new THREE.Line(geometry, material);
          line.userData = {
            originalPoints: points,
            offset: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.008,
          };
          tracerGroup.add(line);
        }

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);

          // Rotate the main elements
          sphere.rotation.y += rotation;
          grid.rotation.y += rotation;

          // Animate tracer lines
          tracerGroup.children.forEach((line) => {
            const userData = line.userData;
            userData.offset += userData.speed;

            // Create animated segments
            const segmentLength = 16;
            const totalPoints = userData.originalPoints.length;
            const startIndex = Math.floor((userData.offset * totalPoints) / (Math.PI * 2)) % totalPoints;
            
            const animatedPoints = [];
            for (let i = 0; i < segmentLength; i++) {
              const index = (startIndex + i) % totalPoints;
              animatedPoints.push(userData.originalPoints[index]);
            }

            // Update geometry
            const lineGeometry = (line as THREE.Line).geometry as THREE.BufferGeometry;
            lineGeometry.setFromPoints(animatedPoints);
            lineGeometry.attributes.position.needsUpdate = true;
          });

          // Render the scene
          renderer.render(scene, camera);
        };

        // Handle resize
        const handleResize = () => {
          if (!container || !renderer) return;

          const newRect = container.getBoundingClientRect();
          const newWidth = newRect.width || 400;
          const newHeight = newRect.height || 400;

          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        // Start animation
        animate();
        window.addEventListener("resize", handleResize);

        // Initial resize to ensure proper aspect ratio
        handleResize();

        setIsLoading(false);

        // Cleanup function
        return () => {
          window.removeEventListener("resize", handleResize);
          cleanup();
        };
      } catch (error) {
        console.error("Globe initialization error:", error);
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, [mounted, color, wireframe, rotation, gridOpacity, isDarkMode, cleanup, randomPointOnSphere]);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-6 h-32 w-32 rounded-full bg-blue-200 dark:bg-blue-800 animate-spin"></div>
          <div className="mb-2.5 h-4 w-32 rounded bg-blue-200 dark:bg-blue-800"></div>
          <div className="h-2 w-24 rounded bg-blue-200 dark:bg-blue-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative"
      style={{ 
        minHeight: "400px",
        background: "transparent",
        touchAction: "none" // Prevent mobile scrolling issues
      }}
    />
  );
};

export default SimpleGlobe;
