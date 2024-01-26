import * as THREE from 'three';
import { ModelMaterialColor, ModelTextureTransform } from './types.js';
import Model from './Model.js';
import ModelAnimator from './ModelAnimator.js';

class ModelAnimation extends THREE.Object3D {
  // States
  textureWeights: number[] = [];
  textureTransforms: ModelTextureTransform[] = [];
  materialColors: ModelMaterialColor[] = [];

  #model: Model;
  #animator: ModelAnimator;
  #actions: Set<THREE.AnimationAction> = new Set();

  constructor(model: Model, animator: ModelAnimator, stateCounts: Record<string, number>) {
    super();

    this.#model = model;
    this.#animator = animator;
    this.#createStates(stateCounts);

    this.#autoplay();
  }

  dispose() {
    for (const action of this.#actions.values()) {
      this.#animator.clearAction(action);
    }

    this.#actions.clear();
  }

  #createStates(stateCounts: Record<string, number>) {
    for (let i = 0; i < stateCounts.textureWeights; i++) {
      this.textureWeights.push(1.0);
    }

    for (let i = 0; i < stateCounts.textureTransforms; i++) {
      this.textureTransforms.push({
        translation: new THREE.Vector3(),
        rotation: new THREE.Quaternion(),
        scaling: new THREE.Vector3(1.0, 1.0, 1.0),
      });
    }

    for (let i = 0; i < stateCounts.materialColors; i++) {
      this.materialColors.push({
        color: new THREE.Color(1.0, 1.0, 1.0),
        alpha: 1.0,
      });
    }
  }

  #autoplay() {
    // Automatically play all loops
    for (let i = 0; i < this.#animator.loops.length; i++) {
      const action = this.#animator.getLoop(this, i).play();
      this.#actions.add(action);
    }

    // Automatically play flagged sequences
    for (let i = 0; i < this.#animator.sequences.length; i++) {
      const sequence = this.#animator.sequences[i];

      if (sequence.flags & 0x20) {
        const action = this.#animator.getSequence(this, i).play();
        this.#actions.add(action);
      }
    }
  }
}

export default ModelAnimation;
