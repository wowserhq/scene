import { M2Batch, M2Model, M2SkinProfile } from '@wowserhq/format';
import { ModelBounds, ModelSpec, SequenceSpec } from './types.js';
import { expandExtent, getBoundsCenter, getBoundsRadius } from './util.js';
import SceneWorker from '../../worker/SceneWorker.js';
import { AssetHost, loadAsset } from '../../asset.js';

type ModelLoaderWorkerOptions = {
  host: AssetHost;
};

class ModelLoaderWorker extends SceneWorker {
  #host: AssetHost;

  initialize(options: ModelLoaderWorkerOptions) {
    this.#host = options.host;
  }

  async loadSpec(path: string) {
    const modelData = await loadAsset(this.#host, path);
    const model = new M2Model().load(modelData);

    const modelBasePath = path.split('.').at(0);
    const skinProfileIndex = model.skinProfileCount - 1;
    const skinProfileSuffix = skinProfileIndex.toString().padStart(2, '0');
    const skinProfilePath = `${modelBasePath}${skinProfileSuffix}.skin`;

    const skinProfileData = await loadAsset(this.#host, skinProfilePath);
    const skinProfile = new M2SkinProfile(model).load(skinProfileData);

    const geometry = this.#createGeometrySpec(model, skinProfile);
    const materials = this.#createMaterialSpecs(skinProfile);
    const { bones, skinned } = this.#createBoneSpecs(model);
    const { sequences, sequenceBounds } = this.#createSequenceSpecs(model);
    const loops = model.loops;
    const textureWeights = model.textureWeights;
    const textureTransforms = model.textureTransforms;
    const materialColors = model.colors;

    // Expand geometry bounds by sequence bounds to produce model bounds
    const extent = geometry.bounds.extent.slice(0);
    expandExtent(extent, sequenceBounds.extent);
    const bounds: ModelBounds = {
      extent,
      center: getBoundsCenter(extent),
      radius: getBoundsRadius(extent),
    };

    const spec: ModelSpec = {
      name: model.name,
      geometry,
      materials,
      bones,
      skinned,
      loops,
      sequences,
      bounds,
      textureWeights,
      textureTransforms,
      materialColors,
    };

    const transfer = [spec.geometry.vertexBuffer, spec.geometry.indexBuffer];

    return [spec, transfer];
  }

  #extractVertices(model: M2Model, skinProfile: M2SkinProfile) {
    const vertexArray = new Uint8Array(skinProfile.vertices.length * 48);
    const sourceArray = new Uint8Array(model.vertices);

    for (let i = 0, j = 0; i < skinProfile.vertices.length; i++, j += 48) {
      const vertexIndex = skinProfile.vertices[i];
      const vertex = sourceArray.subarray(vertexIndex * 48, (vertexIndex + 1) * 48);
      vertexArray.set(vertex, j);
    }

    return vertexArray.buffer;
  }

  #createGeometrySpec(model: M2Model, skinProfile: M2SkinProfile) {
    const bounds = {
      extent: model.bounds.extent,
      center: getBoundsCenter(model.bounds.extent),
      radius: model.bounds.radius,
    };
    const vertexBuffer = this.#extractVertices(model, skinProfile);
    const indexBuffer = skinProfile.indices.buffer;

    const groups = [];
    for (let i = 0; i < skinProfile.batches.length; i++) {
      const batch = skinProfile.batches[i];
      groups.push({
        start: batch.skinSection.indexStart,
        count: batch.skinSection.indexCount,
        materialIndex: i,
      });
    }

    return {
      bounds,
      vertexBuffer,
      indexBuffer,
      groups,
    };
  }

  #createMaterialSpecs(skinProfile: M2SkinProfile) {
    return skinProfile.batches.map((batch) => this.#createMaterialSpec(batch));
  }

  #createMaterialSpec(batch: M2Batch) {
    const textures = batch.textures.map((texture) => ({
      flags: texture.flags,
      component: texture.component,
      path: texture.filename,
    }));

    return {
      flags: batch.material.flags,
      blend: batch.material.blend,
      textures,
      textureWeightIndex: batch.textureWeightIndex,
      textureTransformIndices: batch.textureTransformIndices,
      materialColorIndex: batch.colorIndex,
      vertexShader: batch.vertexShader,
      fragmentShader: batch.fragmentShader,
    };
  }

  #createSequenceSpecs(model: M2Model) {
    const extent = new Float32Array(6);
    const sequenceSpecs: SequenceSpec[] = [];

    for (const sequence of model.sequences) {
      expandExtent(extent, sequence.bounds.extent);

      sequenceSpecs.push({
        id: sequence.id,
        variationIndex: sequence.variationIndex,
        duration: sequence.duration,
        moveSpeed: sequence.moveSpeed,
        flags: sequence.flags,
        frequency: sequence.frequency,
        blendTime: sequence.blendTime,
        variationNext: sequence.variationNext,
        aliasNext: sequence.aliasNext,
      });
    }

    // Produce bounds that encompass all sequences
    const sequenceBounds: ModelBounds = {
      extent,
      center: getBoundsCenter(extent),
      radius: getBoundsRadius(extent),
    };

    return { sequences: sequenceSpecs, sequenceBounds };
  }

  #createBoneSpecs(model: M2Model) {
    const boneSpecs = [];
    let skinned = false;

    for (const bone of model.bones) {
      let position = bone.pivot;

      // Convert pivot to absolute position
      let parentBone = boneSpecs[bone.parentIndex];
      while (parentBone) {
        position[0] -= parentBone.position[0];
        position[1] -= parentBone.position[1];
        position[2] -= parentBone.position[2];

        parentBone = boneSpecs[parentBone.parentIndex];
      }

      // Convert translation track to position track
      const positionTrack = bone.translationTrack;
      for (let s = 0; s < positionTrack.sequenceKeys.length; s++) {
        const values = positionTrack.sequenceKeys[s];
        for (let i = 0; i < values.length / 3; i++) {
          values[i * 3] += position[0];
          values[i * 3 + 1] += position[1];
          values[i * 3 + 2] += position[2];
        }
      }

      // If bone animations are present, the model needs skinning
      const hasTranslationAnim = bone.translationTrack.sequenceTimes.length > 0;
      const hasRotationAnim = bone.rotationTrack.sequenceTimes.length > 0;
      const hasScaleAnim = bone.scaleTrack.sequenceTimes.length > 0;
      if (hasTranslationAnim || hasRotationAnim || hasScaleAnim) {
        skinned = true;
      }

      // If bone is billboarded, the model needs skinning
      if (bone.flags & (0x8 | 0x10 | 0x20 | 0x40)) {
        skinned = true;
      }

      boneSpecs.push({
        position,
        parentIndex: bone.parentIndex,
        flags: bone.flags,
        positionTrack: positionTrack,
        rotationTrack: bone.rotationTrack,
        scaleTrack: bone.scaleTrack,
      });
    }

    return { bones: boneSpecs, skinned };
  }
}

export default ModelLoaderWorker;
