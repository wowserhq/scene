import { M2Batch, M2Model, M2SkinProfile } from '@wowserhq/format';
import { ModelSpec } from './types.js';
import { getFragmentShader, getVertexShader } from './util.js';
import SceneWorker from '../../worker/SceneWorker.js';
import { normalizePath } from '../../util.js';

class ModelLoaderWorker extends SceneWorker {
  #baseUrl: string;
  #normalizePath: boolean;

  initialize(baseUrl: string, normalizePath: boolean) {
    this.#baseUrl = baseUrl;
    this.#normalizePath = normalizePath;
  }

  async loadSpec(path: string) {
    const modelData = await this.#loadData(path);
    const model = new M2Model().load(modelData);

    const modelBasePath = path.split('.').at(0);
    const skinProfileIndex = model.skinProfileCount - 1;
    const skinProfileSuffix = skinProfileIndex.toString().padStart(2, '0');
    const skinProfilePath = `${modelBasePath}${skinProfileSuffix}.skin`;

    const skinProfileData = await this.#loadData(skinProfilePath);
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

  async #loadData(path: string) {
    const response = await fetch(this.#getFullUrl(path));

    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
    }

    return response.arrayBuffer();
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

  #getFullUrl(path: string) {
    const urlPath = this.#normalizePath ? normalizePath(path) : path;
    return `${this.#baseUrl}/${urlPath}`;
  }
}

export default ModelLoaderWorker;
