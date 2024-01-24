import * as THREE from 'three';
import ModelMaterial from './ModelMaterial.js';
import ModelAnimator from './ModelAnimator.js';

type ModelTextureTransform = {
  translation: THREE.Vector3;
  rotation: THREE.Quaternion;
  scaling: THREE.Vector3;
};

class ModelMesh extends THREE.Mesh {
  #animator: ModelAnimator;
  #diffuseColor: THREE.Color;
  #emissiveColor: THREE.Color;
  #alpha: 1.0;

  textureWeights: number[] = [];
  textureTransforms: ModelTextureTransform[] = [];

  constructor(
    geometry: THREE.BufferGeometry,
    materials: THREE.Material[],
    animator: ModelAnimator,
    textureWeightCount: number,
    textureTransformCount: number,
  ) {
    super(geometry, materials);

    this.#animator = animator;

    // Defaults

    this.#diffuseColor = new THREE.Color(1.0, 1.0, 1.0);
    this.#emissiveColor = new THREE.Color(0.0, 0.0, 0.0);

    this.#alpha = 1.0;

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

    // Animations

    // Automatically play all loops
    for (let i = 0; i < this.#animator.loops.length; i++) {
      this.#animator.getLoop(this, i).play();
    }

    // Automatically play flagged sequences
    for (let i = 0; i < this.#animator.sequences.length; i++) {
      const sequence = this.#animator.sequences[i];

      if (sequence.flags & 0x20) {
        this.#animator.getSequence(this, i).play();
      }
    }
  }

  onBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    geometry: THREE.BufferGeometry,
    material: ModelMaterial,
    group: THREE.Group,
  ) {
    const textureWeight = this.textureWeights[material.textureWeightIndex] ?? 1.0;
    material.alpha = this.#alpha * textureWeight;

    material.setDiffuseColor(this.#diffuseColor);
    material.setEmissiveColor(this.#emissiveColor);

    for (let i = 0; i < material.textureTransformIndices.length; i++) {
      const transformIndex = material.textureTransformIndices[i];
      const { translation, rotation, scaling } = this.textureTransforms[transformIndex];
      material.setTextureTransform(i, translation, rotation, scaling);
    }
  }
}

export default ModelMesh;
export { ModelMesh };
