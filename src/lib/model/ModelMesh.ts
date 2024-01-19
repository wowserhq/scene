import * as THREE from 'three';
import ModelMaterial from './ModelMaterial.js';

class ModelMesh extends THREE.Mesh {
  #diffuseColor: THREE.Color;
  #emissiveColor: THREE.Color;
  #alpha: 1.0;

  constructor(geometry: THREE.BufferGeometry, materials: THREE.Material[]) {
    super(geometry, materials);

    this.#diffuseColor = new THREE.Color(1.0, 1.0, 1.0);
    this.#emissiveColor = new THREE.Color(0.0, 0.0, 0.0);
    this.#alpha = 1.0;
  }

  onBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    geometry: THREE.BufferGeometry,
    material: ModelMaterial,
    group: THREE.Group,
  ) {
    material.alpha = this.#alpha;
    material.setDiffuseColor(this.#diffuseColor);
    material.setEmissiveColor(this.#emissiveColor);
  }
}

export default ModelMesh;
export { ModelMesh };
