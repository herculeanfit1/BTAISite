// Mock implementation for three/webgpu
// This provides empty implementations to prevent build errors

export class StorageInstancedBufferAttribute {
  constructor() {
    // Empty implementation
  }
}

export class WebGPURenderer {
  constructor() {
    // Empty implementation
  }
}

// Export other classes that might be imported
export default {
  StorageInstancedBufferAttribute,
  WebGPURenderer,
};
