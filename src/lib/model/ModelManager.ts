import * as THREE from 'three';
import { M2_TEXTURE_COMPONENT, M2_TEXTURE_FLAG } from '@wowserhq/format';
import TextureManager from '../texture/TextureManager.js';
import { AssetHost, normalizePath } from '../asset.js';
import ModelMesh from './ModelMesh.js';
import ModelMaterial from './ModelMaterial.js';
import { getVertexShader } from './shader/vertex.js';
import { getFragmentShader } from './shader/fragment.js';
import { M2_MATERIAL_PASS } from './const.js';
import ModelLoader from './loader/ModelLoader.js';
import { MaterialSpec, ModelSpec, TextureSpec } from './loader/types.js';
import SceneLight from '../light/SceneLight.js';

type ModelResources = {
  name: string;
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
};

type ModelManagerOptions = {
  host: AssetHost;
  textureManager?: TextureManager;
  sceneLight?: SceneLight;
};

class ModelManager {
  #host: AssetHost;
  #textureManager: TextureManager;
  #sceneLight: SceneLight;

  #loader: ModelLoader;
  #loaded = new globalThis.Map<string, ModelResources>();
  #loading = new globalThis.Map<string, Promise<ModelResources>>();

  constructor(options: ModelManagerOptions) {
    this.#host = options.host;

    this.#textureManager = options.textureManager ?? new TextureManager({ host: options.host });
    this.#loader = new ModelLoader({ host: options.host });

    this.#sceneLight = options.sceneLight ?? new SceneLight();
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
    const spec = await this.#loader.loadSpec(path);

    const geometry = await this.#createGeometry(spec);
    const materials = await this.#createMaterials(spec);

    const resources: ModelResources = {
      name: spec.name,
      geometry,
      materials,
    };

    this.#loaded.set(refId, resources);
    this.#loading.delete(refId);

    return resources;
  }

  async #createGeometry(spec: ModelSpec) {
    const vertexBuffer = spec.geometry.vertexBuffer;
    const indexBuffer = spec.geometry.indexBuffer;

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

    const index = new THREE.BufferAttribute(new Uint16Array(indexBuffer), 1, false);
    geometry.setIndex(index);

    for (const group of spec.geometry.groups) {
      geometry.addGroup(group.start, group.count, group.materialIndex);
    }

    // Bounds

    geometry.boundingBox = new THREE.Box3().setFromArray(spec.geometry.bounds.extent);

    const boundsCenter = new THREE.Vector3(
      spec.geometry.bounds.center[0],
      spec.geometry.bounds.center[1],
      spec.geometry.bounds.center[2],
    );
    geometry.boundingSphere = new THREE.Sphere(boundsCenter, spec.geometry.bounds.radius);

    return geometry;
  }

  #createMaterials(spec: ModelSpec) {
    return Promise.all(spec.materials.map((materialSpec) => this.#createMaterial(materialSpec)));
  }

  async #createMaterial(spec: MaterialSpec) {
    const vertexShader = getVertexShader(spec.vertexShader);
    const fragmentShader = getFragmentShader(spec.fragmentShader);
    const textures = await Promise.all(
      spec.textures.map((textureSpec) => this.#createTexture(textureSpec)),
    );
    const uniforms = { ...this.#sceneLight.uniforms };

    return new ModelMaterial(
      vertexShader,
      fragmentShader,
      textures,
      uniforms,
      spec.blend,
      M2_MATERIAL_PASS.PASS_0,
      spec.flags,
    );
  }

  async #createTexture(spec: TextureSpec) {
    const wrapS =
      spec.flags & M2_TEXTURE_FLAG.FLAG_WRAP_S ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    const wrapT =
      spec.flags & M2_TEXTURE_FLAG.FLAG_WRAP_T ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

    if (spec.component === M2_TEXTURE_COMPONENT.COMPONENT_NONE) {
      return this.#textureManager.get(spec.path, wrapS, wrapT);
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
