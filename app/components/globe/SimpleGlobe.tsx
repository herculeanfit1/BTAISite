"use client";

import React, { useRef, useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);

    // Don't initialize Three.js until component is mounted
    if (!mounted || !containerRef.current) return;

    // Create a scene
    const scene = new THREE.Scene();
    // Make background darker for better contrast
    scene.background = new THREE.Color(isDarkMode ? "#050714" : "#0a0f2d");

    // Create a camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 2.5;

    // Create a renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);

    // Clear the container before adding
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Add renderer to DOM
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create the sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: color,
      wireframe: wireframe,
      transparent: true,
      opacity: 0.7,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Create grid lines (graticules) - 50% fewer segments
    const gridGeometry = new THREE.SphereGeometry(1.01, 16, 16); // Reduced from 32,32 to 16,16
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

    // Create a group for arcs
    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);

    // Create a group for tracer lines
    const tracerGroup = new THREE.Group();
    scene.add(tracerGroup);

    // Function to create arcs
    const createArcs = () => {
      // Clear existing arcs
      while (arcsGroup.children.length) {
        arcsGroup.remove(arcsGroup.children[0]);
      }

      // Create 6 random arcs
      for (let i = 0; i < 6; i++) {
        // Generate random points on sphere
        const point1 = randomPointOnSphere();
        const point2 = randomPointOnSphere();

        // Create curve between points
        const curve = new THREE.QuadraticBezierCurve3(
          point1,
          new THREE.Vector3(
            (point1.x + point2.x) * 0.5,
            (point1.y + point2.y) * 0.5,
            (point1.z + point2.z) * 0.5
          )
            .normalize()
            .multiplyScalar(1.5),
          point2
        );

        // Create line from curve
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create dashed line material
        const material = new THREE.LineDashedMaterial({
          color: color,
          dashSize: 0.1,
          gapSize: 0.05,
          opacity: 0.7,
          transparent: true,
        });

        // Create line and add to group
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances(); // Required for dashed lines
        arcsGroup.add(line);
      }
    };

    // Create red tracer lines moving along longitudes and latitudes
    const createTracerLines = () => {
      // Clear existing tracer lines
      while (tracerGroup.children.length) {
        tracerGroup.remove(tracerGroup.children[0]);
      }

      // Create longitude tracers (vertical circles) - reduced to 2
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const points = [];

        // Create a circle along a longitude
        for (let j = 0; j <= 50; j++) {
          const phi = (j / 50) * Math.PI * 2 - Math.PI / 2;
          points.push(
            new THREE.Vector3(
              1.015 * Math.cos(angle) * Math.cos(phi),
              1.015 * Math.sin(phi),
              1.015 * Math.sin(angle) * Math.cos(phi)
            )
          );
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // Use a solid line with repeating geometry instead of dashed material
        const material = new THREE.LineBasicMaterial({
          color: "#ff00ff", // Neon magenta for more vibrant appearance
          transparent: true,
          opacity: 1.0, // Full opacity
        });

        // Create multiple small line segments for animation
        const numSegments = 10;
        const segmentLength = Math.floor(points.length / numSegments);

        for (let k = 0; k < numSegments; k += 2) {
          // Create segments with gaps
          const segmentPoints = points.slice(
            k * segmentLength,
            (k + 1) * segmentLength
          );

          const segmentGeometry = new THREE.BufferGeometry().setFromPoints(
            segmentPoints
          );
          const line = new THREE.Line(segmentGeometry, material);

          // Store the starting position and speed
          line.userData.progress = Math.random();
          line.userData.speed = 0.005 + Math.random() * 0.003;
          line.userData.segmentIndex = k;
          line.userData.totalSegments = numSegments;
          line.userData.points = points;
          line.userData.isLatitude = false;

          tracerGroup.add(line);
        }
      }

      // Create latitude tracers (horizontal circles) - reduced to 2
      for (let i = 0; i < 2; i++) {
        const phi = (Math.random() - 0.5) * Math.PI; // Random latitude
        const points = [];

        // Create a circle along a latitude
        for (let j = 0; j <= 50; j++) {
          const theta = (j / 50) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              1.015 * Math.cos(theta) * Math.cos(phi),
              1.015 * Math.sin(phi),
              1.015 * Math.sin(theta) * Math.cos(phi)
            )
          );
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: "#00ffff", // Neon cyan for more vibrant appearance
          transparent: true,
          opacity: 1.0, // Full opacity
        });

        // Create multiple small line segments for animation
        const numSegments = 10;
        const segmentLength = Math.floor(points.length / numSegments);

        for (let k = 0; k < numSegments; k += 2) {
          // Create segments with gaps
          const segmentPoints = points.slice(
            k * segmentLength,
            (k + 1) * segmentLength
          );

          const segmentGeometry = new THREE.BufferGeometry().setFromPoints(
            segmentPoints
          );
          const line = new THREE.Line(segmentGeometry, material);

          // Store the starting position and speed
          line.userData.progress = Math.random();
          line.userData.speed = 0.005 + Math.random() * 0.003;
          line.userData.segmentIndex = k;
          line.userData.totalSegments = numSegments;
          line.userData.points = points;
          line.userData.isLatitude = true;

          tracerGroup.add(line);
        }
      }
    };

    // Function to generate random point on sphere
    const randomPointOnSphere = () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      return new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
    };

    // Create initial arcs and tracers
    createArcs();
    createTracerLines();

    // Animation function
    const animate = () => {
      const animationId = requestAnimationFrame(animate);

      // Rotate the sphere and grid
      sphere.rotation.y += rotation;
      grid.rotation.y += rotation;
      arcsGroup.rotation.y += rotation;
      tracerGroup.rotation.y += rotation;

      // Animate tracer lines
      tracerGroup.children.forEach((line) => {
        // Update progress
        line.userData.progress += line.userData.speed;
        if (line.userData.progress > 1) {
          line.userData.progress = 0;
        }

        // Move the line segment along the circle path
        const points = line.userData.points;
        const totalPoints = points.length;
        const segmentLength = Math.floor(
          totalPoints / line.userData.totalSegments
        );
        const offset = Math.floor(line.userData.progress * totalPoints);

        // Create new set of points with offset
        const newPoints = [];
        for (let i = 0; i < segmentLength; i++) {
          const index = (offset + i) % totalPoints;
          newPoints.push(points[index]);
        }

        // Update the geometry
        const lineGeometry = (line as THREE.Line)
          .geometry as THREE.BufferGeometry;
        lineGeometry.setFromPoints(newPoints);
        lineGeometry.attributes.position.needsUpdate = true;
      });

      // Render the scene
      renderer.render(scene, camera);

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationId);
      };
    };

    // Start animation
    const animationCleanup = animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
      if (animationCleanup) {
        animationCleanup();
      }
    };
  }, [mounted, color, wireframe, rotation, gridOpacity, isDarkMode]);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-6 h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-800"></div>
          <div className="mb-2.5 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "300px" }}
    />
  );
};

export default SimpleGlobe;
