import * as THREE from 'three';

class TerrainMesh extends THREE.Mesh {
  constructor(position: Float32Array, geometry: THREE.BufferGeometry, material: THREE.Material) {
    // We need these for frustum culling, so we might as well take the hit on creation
    geometry.computeBoundingSphere();

    super(geometry);

    this.material = material;

    this.position.set(position[0], position[1], position[2]);
    this.updateMatrixWorld();
  }
}

export default TerrainMesh;
export { TerrainMesh };
