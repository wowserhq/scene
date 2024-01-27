import * as THREE from 'three';
import { ModelMaterialColor, ModelTextureTransform } from './types.js';
import Model from './Model.js';
import ModelAnimator from './ModelAnimator.js';
import { BoneSpec } from './loader/types.js';

class ModelAnimation extends THREE.Object3D {
  // States
  textureWeights: number[] = [];
  textureTransforms: ModelTextureTransform[] = [];
  materialColors: ModelMaterialColor[] = [];

  // Skeleton
  skeleton: THREE.Skeleton;
  rootBones: THREE.Bone[];

  #model: Model;
  #animator: ModelAnimator;
  #actions: Set<THREE.AnimationAction> = new Set();

  constructor(
    model: Model,
    animator: ModelAnimator,
    bones: BoneSpec[],
    stateCounts: Record<string, number>,
  ) {
    super();

    this.#model = model;
    this.#animator = animator;
    this.#createStates(stateCounts);
    this.#createSkeleton(bones);

    this.#autoplay();
  }

  dispose() {
    for (const action of this.#actions.values()) {
      this.#animator.clearAction(action);
    }

    this.#actions.clear();

    this.skeleton.dispose();
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

  #createSkeleton(boneSpecs: BoneSpec[]) {
    const bones: THREE.Bone[] = [];
    const rootBones: THREE.Bone[] = [];

    for (const boneSpec of boneSpecs) {
      const bone = new THREE.Bone();
      bone.visible = false;
      bone.position.set(boneSpec.position[0], boneSpec.position[1], boneSpec.position[2]);
      bones.push(bone);

      if (boneSpec.parentIndex === -1) {
        rootBones.push(bone);
      } else {
        bones[boneSpec.parentIndex].add(bone);
      }
    }

    this.skeleton = new THREE.Skeleton(bones);
    this.rootBones = rootBones;
  }

  #autoplay() {
    // Automatically play all loops
    for (let i = 0; i < this.#animator.loops.length; i++) {
      const action = this.#animator.getLoop(this, i).play();
      this.#actions.add(action);
    }

    // Automatically play sequence id 0
    if (this.#animator.sequences.has(0)) {
      const variations = this.#animator.sequences.get(0);
      const sequence = variations[0];

      if (sequence.flags & 0x20) {
        const action = this.#animator.getSequence(this, sequence.id, sequence.variationIndex);
        action.play();
        this.#actions.add(action);
      }
    }
  }
}

export default ModelAnimation;
