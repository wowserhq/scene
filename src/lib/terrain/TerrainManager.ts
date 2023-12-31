import * as THREE from 'three';
import { MapChunk, MapArea } from '@wowserhq/format';
import { createSplatTexture } from './material.js';
import { createTerrainIndexBuffer, createTerrainVertexBuffer } from './geometry.js';
import TextureManager from '../texture/TextureManager.js';
import TerrainMaterial from './TerrainMaterial.js';
import TerrainMesh from './TerrainMesh.js';

class TerrainManager {
  #textureManager: TextureManager;
  #loadedAreas = new globalThis.Map<number, THREE.Group>();
  #loadingAreas = new globalThis.Map<number, Promise<THREE.Group>>();

  constructor(textureManager: TextureManager) {
    this.#textureManager = textureManager;
  }

  getArea(areaId: number, area: MapArea): Promise<THREE.Group> {
    const loaded = this.#loadedAreas.get(areaId);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loadingAreas.get(areaId);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#loadArea(areaId, area);
    this.#loadingAreas.set(areaId, loading);

    return loading;
  }

  removeArea(areaId: number) {
    const group = this.#loadedAreas.get(areaId);
    if (!group) {
      return;
    }

    for (const mesh of group.children) {
      (mesh as TerrainMesh).dispose();
    }

    this.#loadedAreas.delete(areaId);
  }

  async #loadArea(areaId: number, area: MapArea) {
    const group = new THREE.Group();
    group.name = 'terrain';
    group.matrixAutoUpdate = false;
    group.matrixWorldAutoUpdate = false;

    for (const chunk of area.chunks) {
      if (chunk.layers.length === 0) {
        continue;
      }

      const mesh = await this.#createMesh(chunk);
      group.add(mesh);
    }

    this.#loadedAreas.set(areaId, group);
    this.#loadingAreas.delete(areaId);

    return group;
  }

  async #createMesh(chunk: MapChunk) {
    const [geometry, material] = await Promise.all([
      this.#createGeometry(chunk),
      this.#createMaterial(chunk),
    ]);

    return new TerrainMesh(chunk.position, geometry, material);
  }

  async #createGeometry(chunk: MapChunk) {
    const [vertexBuffer, indexBuffer] = await Promise.all([
      createTerrainVertexBuffer(chunk),
      createTerrainIndexBuffer(chunk),
    ]);

    const geometry = new THREE.BufferGeometry();

    const positions = new THREE.InterleavedBuffer(new Float32Array(vertexBuffer), 4);
    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(positions, 3, 0, false));

    const normals = new THREE.InterleavedBuffer(new Int8Array(vertexBuffer), 16);
    geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(normals, 4, 12, true));

    const index = new THREE.BufferAttribute(new Uint16Array(indexBuffer), 1, false);
    geometry.setIndex(index);

    return geometry;
  }

  async #createMaterial(chunk: MapChunk) {
    const [splatTexture, ...layerTextures] = await Promise.all([
      createSplatTexture(chunk.layers),
      ...chunk.layers.map((layer) => this.#textureManager.get(layer.texture)),
    ]);

    return new TerrainMaterial(chunk.layers.length, layerTextures, splatTexture);
  }
}

export default TerrainManager;
export { TerrainManager };
