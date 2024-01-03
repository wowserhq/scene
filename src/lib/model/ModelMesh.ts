import * as THREE from 'three';

class ModelMesh extends THREE.Mesh {
  constructor(geometry: THREE.BufferGeometry, materials: THREE.Material[]) {
    super(geometry, materials);
  }
}

export default ModelMesh;
export { ModelMesh };
