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
  #skinned: boolean;

  #boundingSphereWorld = new THREE.Sphere();

  constructor(
    geometry: THREE.BufferGeometry,
    materials: THREE.Material[],
    animator: ModelAnimator,
    skinned: boolean,
  ) {
    super();

    this.#skinned = skinned;

    // Avoid skinning overhead when model does not make use of bone animations
    if (skinned) {
      this.#mesh = new THREE.SkinnedMesh(geometry, materials);
    } else {
      this.#mesh = new THREE.Mesh(geometry, materials);
    }

    this.#mesh.frustumCulled = false;
    this.#mesh.onBeforeRender = this.#onBeforeRender.bind(this);
    this.add(this.#mesh);

    // Every model instance gets a unique animation state managed by a single animator
    this.animation = animator.createAnimation(this);

    // Every skinned model instance gets a unique skeleton
    if (skinned) {
      this.#mesh.add(...this.animation.rootBones);
      (this.#mesh as THREE.SkinnedMesh).bind(this.animation.skeleton);
    }

    this.diffuseColor = new THREE.Color(1.0, 1.0, 1.0);
    this.emissiveColor = new THREE.Color(0.0, 0.0, 0.0);
    this.alpha = 1.0;
  }

  get boundingBox() {
    return this.#mesh.geometry.boundingBox;
  }

  get boundingSphere() {
    return this.#mesh.geometry.boundingSphere;
  }

  get boundingSphereWorld() {
    return this.#boundingSphereWorld;
  }

  get skinned() {
    return this.#skinned;
  }

  hide() {
    if (!this.visible) {
      return;
    }

    this.visible = false;
    this.animation.suspend();
  }

  dispose() {
    this.animation.dispose();
  }

  show() {
    if (this.visible) {
      return;
    }

    this.visible = true;
    this.animation.resume();
  }

  updateMatrixWorld(force?: boolean) {
    super.updateMatrixWorld(force);

    this.#boundingSphereWorld.copy(this.boundingSphere).applyMatrix4(this.matrixWorld);
  }

  #onBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    geometry: THREE.BufferGeometry,
    material: ModelMaterial,
    group: THREE.Group,
  ) {
    // Update material uniforms to match animation states
    material.prepareMaterial(this);
  }
}

export default Model;
export { Model };
