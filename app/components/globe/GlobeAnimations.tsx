import * as THREE from "three";
import { randomPointOnSphere } from "./GlobeCore";

/**
 * Creates animated arcs between random points on the globe
 */
export const createArcs = (color: string) => {
  const arcsGroup = new THREE.Group();

  // Create 6 random arcs
  for (let i = 0; i < 6; i++) {
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

  return arcsGroup;
};

/**
 * Creates animated tracer lines moving along longitudes and latitudes
 */
export const createTracerLines = () => {
  const tracerGroup = new THREE.Group();

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
    const latitude = (Math.random() - 0.5) * Math.PI;
    const points = [];

    // Create a circle along a latitude
    for (let j = 0; j <= 50; j++) {
      const theta = (j / 50) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          1.015 * Math.cos(latitude) * Math.cos(theta),
          1.015 * Math.sin(latitude),
          1.015 * Math.cos(latitude) * Math.sin(theta)
        )
      );
    }

    const material = new THREE.LineBasicMaterial({
      color: "#00ffff", // Cyan for latitude lines
      transparent: true,
      opacity: 1.0,
    });

    // Create multiple small line segments for animation
    const numSegments = 10;
    const segmentLength = Math.floor(points.length / numSegments);

    for (let k = 0; k < numSegments; k += 2) {
      const segmentPoints = points.slice(
        k * segmentLength,
        (k + 1) * segmentLength
      );

      const segmentGeometry = new THREE.BufferGeometry().setFromPoints(
        segmentPoints
      );
      const line = new THREE.Line(segmentGeometry, material);

      // Store animation data
      line.userData.progress = Math.random();
      line.userData.speed = 0.003 + Math.random() * 0.002;
      line.userData.segmentIndex = k;
      line.userData.totalSegments = numSegments;
      line.userData.points = points;
      line.userData.isLatitude = true;

      tracerGroup.add(line);
    }
  }

  return tracerGroup;
};

/**
 * Animation loop for updating tracer lines
 */
export const animateTracers = (tracerGroup: THREE.Group) => {
  tracerGroup.children.forEach((child) => {
    const line = child as THREE.Line;
    if (line.userData.progress !== undefined) {
      // Update progress
      line.userData.progress += line.userData.speed;

      // Reset when reaching end
      if (line.userData.progress > 1) {
        line.userData.progress = 0;
      }

      // Update opacity based on progress for pulsing effect
      const material = line.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + 0.7 * Math.sin(line.userData.progress * Math.PI);
    }
  });
}; 