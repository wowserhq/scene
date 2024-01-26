import * as THREE from 'three';
import ModelMaterial from './ModelMaterial.js';
import ModelAnimator from './ModelAnimator.js';
import ModelAnimation from './ModelAnimation.js';

class Model extends THREE.Object3D {
  animation: ModelAnimation;

  diffuseColor: THREE.Color;
  emissiveColor: THREE.Color;
  alpha: 1.0;

  #mesh: THREE.Mesh;

  constructor(
    geometry: THREE.BufferGeometry,
    materials: THREE.Material[],
    animator: ModelAnimator,
  ) {
    super();

    this.#mesh = new THREE.Mesh(geometry, materials);
    this.#mesh.onBeforeRender = this.#onBeforeRender.bind(this);
    this.add(this.#mesh);

    // Every model instance gets a unique animation state managed by a single animator
    this.animation = animator.createAnimation(this);

    this.diffuseColor = new THREE.Color(1.0, 1.0, 1.0);
    this.emissiveColor = new THREE.Color(0.0, 0.0, 0.0);
    this.alpha = 1.0;
  }

  #onBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    geometry: THREE.BufferGeometry,
    material: ModelMaterial,
    group: THREE.Group,
  ) {
    material.prepareMaterial(this);
  }

  dispose() {
    this.animation.dispose();
  }
}

export default Model;
export { Model };
