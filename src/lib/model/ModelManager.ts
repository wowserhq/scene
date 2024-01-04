import * as THREE from 'three';
import {
  M2_MATERIAL_FLAG,
  M2_TEXTURE_COMPONENT,
  M2_TEXTURE_FLAG,
  M2Batch,
  M2Model,
  M2SkinProfile,
  M2Texture,
} from '@wowserhq/format';
import TextureManager from '../texture/TextureManager.js';
import FormatManager from '../FormatManager.js';
import { normalizePath } from '../util.js';
import ModelMesh from './ModelMesh.js';
import ModelMaterial from './ModelMaterial.js';
import { getVertexShader } from './shader/vertex.js';
import { getFragmentShader } from './shader/fragment.js';
import { M2_MATERIAL_PASS } from './const.js';

type ModelResources = {
  name: string;
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
};

class ModelManager {
  #formatManager: FormatManager;
  #textureManager: TextureManager;
  #loaded = new globalThis.Map<string, ModelResources>();
  #loading = new globalThis.Map<string, Promise<ModelResources>>();

  constructor(formatManager: FormatManager, textureManager: TextureManager) {
    this.#formatManager = formatManager;
    this.#textureManager = textureManager;
  }

  async get(path: string) {
    const resources = await this.#getResources(path);
    return this.#createMesh(resources);
  }

  #getResources(path: string) {
    const refId = normalizePath(path);

    const loaded = this.#loaded.get(refId);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loading.get(refId);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#loadResources(refId, path);
    this.#loading.set(refId, loading);

    return loading;
  }

  async #loadResources(refId: string, path: string) {
    const model = await this.#formatManager.get(path, M2Model);

    const modelBasePath = path.split('.').at(0);
    const skinProfileIndex = model.skinProfileCount - 1;
    const skinProfileSuffix = skinProfileIndex.toString().padStart(2, '0');
    const skinProfilePath = `${modelBasePath}${skinProfileSuffix}.skin`;

    const skinProfile = await this.#formatManager.get(skinProfilePath, M2SkinProfile, model);

    const geometry = await this.#createGeometry(model, skinProfile);
    const materials = await this.#createMaterials(skinProfile);

    const resources: ModelResources = {
      name: model.name,
      geometry,
      materials,
    };

    this.#loaded.set(refId, resources);
    this.#loading.delete(refId);

    return resources;
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

  async #createGeometry(model: M2Model, skinProfile: M2SkinProfile) {
    const vertexBuffer = this.#extractVertices(model, skinProfile);
    const indexBuffer = skinProfile.indices;

    const geometry = new THREE.BufferGeometry();

    const positions = new THREE.InterleavedBuffer(new Float32Array(vertexBuffer), 48 / 4);
    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(positions, 3, 0, false));

    const boneWeights = new THREE.InterleavedBuffer(new Uint8Array(vertexBuffer), 48);
    geometry.setAttribute(
      'boneWeights',
      new THREE.InterleavedBufferAttribute(boneWeights, 4, 12, false),
    );

    const boneIndices = new THREE.InterleavedBuffer(new Uint8Array(vertexBuffer), 48);
    geometry.setAttribute(
      'boneIndices',
      new THREE.InterleavedBufferAttribute(boneIndices, 4, 16, false),
    );

    const normals = new THREE.InterleavedBuffer(new Float32Array(vertexBuffer), 48 / 4);
    geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(normals, 3, 20 / 4, true));

    const texCoord1 = new THREE.InterleavedBuffer(new Float32Array(vertexBuffer), 48 / 4);
    geometry.setAttribute(
      'texCoord1',
      new THREE.InterleavedBufferAttribute(texCoord1, 2, 32 / 4, false),
    );

    const texCoord2 = new THREE.InterleavedBuffer(new Float32Array(vertexBuffer), 48 / 4);
    geometry.setAttribute(
      'texCoord2',
      new THREE.InterleavedBufferAttribute(texCoord2, 2, 40 / 4, false),
    );

    const index = new THREE.BufferAttribute(indexBuffer, 1, false);
    geometry.setIndex(index);

    for (let i = 0; i < skinProfile.batches.length; i++) {
      const batch = skinProfile.batches[i];
      geometry.addGroup(batch.skinSection.indexStart, batch.skinSection.indexCount, i);
    }

    return geometry;
  }

  #createMaterials(skinProfile: M2SkinProfile) {
    return Promise.all(skinProfile.batches.map((batch) => this.#createMaterial(batch)));
  }

  async #createMaterial(batch: M2Batch) {
    const coords = batch.textures.map((texture) => texture.textureCoord);
    const combiners = batch.textures.map((texture) => texture.textureCombiner);
    const m2Textures = batch.textures.map((texture) => texture.texture);

    const vertexShader = getVertexShader(coords);
    const fragmentShader = getFragmentShader(combiners);
    const textures = await Promise.all(
      m2Textures.map((m2Texture) => this.#createTexture(m2Texture)),
    );
    const side =
      batch.material.flags & M2_MATERIAL_FLAG.FLAG_TWO_SIDED ? THREE.DoubleSide : THREE.FrontSide;

    return new ModelMaterial(
      vertexShader,
      fragmentShader,
      textures,
      batch.material.blend,
      M2_MATERIAL_PASS.PASS_0,
      side,
    );
  }

  async #createTexture(m2Texture: M2Texture) {
    const wrapS =
      m2Texture.flags & M2_TEXTURE_FLAG.FLAG_WRAP_S
        ? THREE.RepeatWrapping
        : THREE.ClampToEdgeWrapping;
    const wrapT =
      m2Texture.flags & M2_TEXTURE_FLAG.FLAG_WRAP_T
        ? THREE.RepeatWrapping
        : THREE.ClampToEdgeWrapping;

    if (m2Texture.component === M2_TEXTURE_COMPONENT.COMPONENT_NONE) {
      return this.#textureManager.get(m2Texture.filename, wrapS, wrapT);
    }

    // TODO handle other component types

    return new THREE.Texture();
  }

  #createMesh(resources: ModelResources) {
    const mesh = new ModelMesh(resources.geometry, resources.materials);
    mesh.name = resources.name;

    return mesh;
  }
}

export default ModelManager;
export { ModelManager };
