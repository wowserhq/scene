import { M2Batch, M2Model, M2SkinProfile } from '@wowserhq/format';
import { ModelSpec } from './types.js';
import { getBoundsCenter, getFragmentShader, getVertexShader } from './util.js';
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

    const spec: ModelSpec = {
      name: model.name,
      geometry,
      materials,
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
      flags: texture.texture.flags,
      component: texture.texture.component,
      path: texture.texture.filename,
    }));

    const coords = batch.textures.map((texture) => texture.textureCoord);
    const vertexShader = getVertexShader(coords);

    const combiners = batch.textures.map((texture) => texture.textureCombiner);
    const fragmentShader = getFragmentShader(combiners);

    return {
      flags: batch.material.flags,
      blend: batch.material.blend,
      textures,
      vertexShader,
      fragmentShader,
    };
  }
}

export default ModelLoaderWorker;
