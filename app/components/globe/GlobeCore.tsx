import * as THREE from "three";

/**
 * Core Three.js globe configuration and utilities
 */
export interface GlobeConfig {
  color: string;
  wireframe: boolean;
  rotation: number;
  gridOpacity: number;
  isDarkMode: boolean;
}

/**
 * Creates the basic sphere geometry and materials
 */
export const createSphere = (config: GlobeConfig) => {
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: config.color,
    wireframe: config.wireframe,
    transparent: true,
    opacity: 0.7,
  });
  return new THREE.Mesh(sphereGeometry, sphereMaterial);
};

/**
 * Creates the grid lines (graticules)
 */
export const createGrid = (config: GlobeConfig) => {
  const gridGeometry = new THREE.SphereGeometry(1.01, 16, 16);
  const gridMaterial = new THREE.LineBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.gridOpacity,
  });
  return new THREE.LineSegments(
    new THREE.WireframeGeometry(gridGeometry),
    gridMaterial
  );
};

/**
 * Creates lighting setup for the scene
 */
export const createLighting = () => {
  const lights = [];
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  lights.push(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  lights.push(directionalLight);

  return lights;
};

/**
 * Generates a random point on sphere surface
 */
export const randomPointOnSphere = () => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi)
  );
};

/**
 * Creates the scene with background
 */
export const createScene = (isDarkMode: boolean) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(isDarkMode ? "#050714" : "#0a0f2d");
  return scene;
};

/**
 * Creates camera with standard settings
 */
export const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 2.5;
  return camera;
};

/**
 * Creates renderer with optimized settings
 */
export const createRenderer = (container: HTMLElement) => {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}; 