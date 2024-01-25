import * as THREE from 'three';
import ModelMaterial from './ModelMaterial.js';
import ModelAnimator from './ModelAnimator.js';
import { ModelMaterialColor, ModelTextureTransform } from './types.js';

class Model extends THREE.Object3D {
  #mesh: THREE.Mesh;

  #animator: ModelAnimator;
  #animationActions: Set<THREE.AnimationAction> = new Set();

  diffuseColor: THREE.Color;
  emissiveColor: THREE.Color;
  alpha: 1.0;

  textureWeights: number[] = [];
  textureTransforms: ModelTextureTransform[] = [];
  materialColors: ModelMaterialColor[] = [];

  constructor(
    geometry: THREE.BufferGeometry,
    materials: THREE.Material[],
    animator: ModelAnimator,
    textureWeightCount: number,
    textureTransformCount: number,
    materialColorCount: number,
  ) {
    super();

    this.#mesh = new THREE.Mesh(geometry, materials);
    this.#mesh.onBeforeRender = this.#onBeforeRender.bind(this);
    this.add(this.#mesh);

    this.#animator = animator;

    // Defaults

    this.diffuseColor = new THREE.Color(1.0, 1.0, 1.0);
    this.emissiveColor = new THREE.Color(0.0, 0.0, 0.0);

    this.alpha = 1.0;

    for (let i = 0; i < textureWeightCount; i++) {
      this.textureWeights.push(1.0);
    }

    for (let i = 0; i < textureTransformCount; i++) {
      this.textureTransforms.push({
        translation: new THREE.Vector3(),
        rotation: new THREE.Quaternion(),
        scaling: new THREE.Vector3(1.0, 1.0, 1.0),
      });
    }

    for (let i = 0; i < materialColorCount; i++) {
      this.materialColors.push({
        color: new THREE.Color(1.0, 1.0, 1.0),
        alpha: 1.0,
      });
    }

    // Animations

    // Automatically play all loops
    for (let i = 0; i < this.#animator.loops.length; i++) {
      const action = this.#animator.getLoop(this, i).play();
      this.#animationActions.add(action);
    }

    // Automatically play flagged sequences
    for (let i = 0; i < this.#animator.sequences.length; i++) {
      const sequence = this.#animator.sequences[i];

      if (sequence.flags & 0x20) {
        const action = this.#animator.getSequence(this, i).play();
        this.#animationActions.add(action);
      }
    }
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
    for (const action of this.#animationActions.values()) {
      this.#animator.clearAction(action);
    }

    this.#animationActions.clear();
  }
}

export default Model;
export { Model };
