// Mock implementation for three/tsl
// This provides empty exports to prevent build errors

// Export an empty object as default and named exports
export default {};

// Add any specific named exports that might be used
export const MeshBasicNodeMaterial = class {};
export const NodeMaterial = class {};
export const uniform = () => {};
export const attribute = () => {};
export const color = () => {};
export const float = () => {};
export const vec2 = () => {};
export const vec3 = () => {};
export const vec4 = () => {};

// Additional exports needed by three-globe
export const Fn = () => {};
export const If = () => {};
export const Loop = () => {};
export const storage = () => {};
export const instanceIndex = () => {};
