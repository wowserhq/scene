import * as THREE from 'three';
import { Map, MapArea, MAP_CHUNK_HEIGHT, MAP_AREA_COUNT_Y } from '@wowserhq/format';
import FormatManager from '../FormatManager.js';
import TerrainManager from '../terrain/TerrainManager.js';
import TextureManager from '../texture/TextureManager.js';

class MapManager {
  #mapName: string;
  #mapDir: string;
  #map: Map;

  #loadingAreas = new globalThis.Map<number, Promise<MapArea>>();
  #loadedAreas = new globalThis.Map<number, MapArea>();

  #root: THREE.Group;
  #terrainGroups = new globalThis.Map<number, THREE.Group>();

  #formatManager: FormatManager;
  #textureManager: TextureManager;
  #terrainManager: TerrainManager;

  #target = new THREE.Vector2();
  #targetAreaX: number;
  #targetAreaY: number;
  #targetChunkX: number;
  #targetChunkY: number;

  #viewDistance = 1277.0;
  #projScreenMatrix = new THREE.Matrix4();
  #cameraFrustum = new THREE.Frustum();

  #desiredAreas = new Set<number>();

  constructor(mapName: string, formatManager: FormatManager, textureManager: TextureManager) {
    this.#mapName = mapName;
    this.#mapDir = `world/maps/${mapName}`;

    this.#formatManager = formatManager;
    this.#textureManager = textureManager;
    this.#terrainManager = new TerrainManager(this.#textureManager);

    this.#root = new THREE.Group();
    this.#root.name = this.#mapName;
    this.#root.matrixAutoUpdate = false;
    this.#root.matrixWorldAutoUpdate = false;

    this.#loadMap().catch((error) => console.error(error));
    this.#syncAreas().catch((error) => console.error(error));
  }

  get mapMame() {
    return this.#mapName;
  }

  get root() {
    return this.#root;
  }

  setTarget(x: number, y: number) {
    this.#target.set(x, y);

    const previousAreaX = this.#targetAreaX;
    const previousAreaY = this.#targetAreaY;
    const previousChunkX = this.#targetChunkX;
    const previousChunkY = this.#targetChunkY;

    const { areaX, areaY, chunkX, chunkY } = Map.getIndicesFromPosition(x, y);
    this.#targetAreaX = areaX;
    this.#targetAreaY = areaY;
    this.#targetChunkX = chunkX;
    this.#targetChunkY = chunkY;

    if (previousChunkX !== chunkX || previousChunkY !== chunkY) {
      this.#calculateDesiredAreas();
    }
  }

  update(deltaTime: number, camera: THREE.Camera) {
    this.#projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.#cameraFrustum.setFromProjectionMatrix(this.#projScreenMatrix);

    this.#cullGroups();
  }

  #cullGroups() {
    // Terrain groups
    for (const terrainGroup of this.#terrainGroups.values()) {
      terrainGroup.visible = this.#cameraFrustum.intersectsSphere(
        terrainGroup.userData.boundingSphere,
      );
    }
  }

  async #syncAreas() {
    if (!this.#map) {
      requestAnimationFrame(() => this.#syncAreas().catch((error) => console.error(error)));
      return;
    }

    const abandonAreaIds = [];

    for (const areaId of this.#loadedAreas.keys()) {
      if (!this.#desiredAreas.has(areaId)) {
        abandonAreaIds.push(areaId);
      }
    }

    for (const areaId of abandonAreaIds) {
      const terrainGroup = this.#terrainGroups.get(areaId);
      if (terrainGroup) {
        this.#root.remove(terrainGroup);
        this.#terrainGroups.delete(areaId);
        this.#terrainManager.removeArea(areaId);
      }

      this.#loadedAreas.delete(areaId);
    }

    const newAreaIds = [];

    for (const areaId of this.#desiredAreas.values()) {
      // Already loaded or loading
      if (this.#loadingAreas.get(areaId) || this.#loadedAreas.get(areaId)) {
        continue;
      }

      if (this.#map.availableAreas[areaId] === 1) {
        newAreaIds.push(areaId);
      }
    }

    const newAreas = await Promise.all(newAreaIds.map((areaId) => this.#getArea(areaId)));

    for (let i = 0; i < newAreaIds.length; i++) {
      const areaId = newAreaIds[i];
      const newArea = newAreas[i];

      if (!this.#desiredAreas.has(areaId)) {
        this.#loadedAreas.delete(areaId);
        continue;
      }

      const terrainGroup = await this.#terrainManager.getArea(areaId, newArea);
      const terrainBoundingSphere = new THREE.Box3()
        .setFromObject(terrainGroup)
        .getBoundingSphere(new THREE.Sphere());
      terrainGroup.userData.boundingSphere = terrainBoundingSphere;

      this.#terrainGroups.set(areaId, terrainGroup);
      this.#root.add(terrainGroup);
    }

    requestAnimationFrame(() => this.#syncAreas().catch((error) => console.error(error)));
  }

  #getChunkRadius() {
    return this.#viewDistance / MAP_CHUNK_HEIGHT;
  }

  #getAreaId(areaX: number, areaY: number) {
    return areaX * MAP_AREA_COUNT_Y + areaY;
  }

  #getAreaIndex(areaId: number) {
    const areaX = (areaId / MAP_AREA_COUNT_Y) | 0;
    const areaY = areaId % MAP_AREA_COUNT_Y;

    return { areaX, areaY };
  }

  #calculateDesiredAreas() {
    const chunkRadius = this.#getChunkRadius();
    const desiredAreas = new Set<number>();

    for (
      let chunkX = this.#targetChunkX - chunkRadius;
      chunkX <= this.#targetChunkX + chunkRadius;
      chunkX++
    ) {
      for (
        let chunkY = this.#targetChunkY - chunkRadius;
        chunkY <= this.#targetChunkY + chunkRadius;
        chunkY++
      ) {
        const areaX = (chunkX / 16) | 0;
        const areaY = (chunkY / 16) | 0;
        const areaId = this.#getAreaId(areaX, areaY);

        desiredAreas.add(areaId);
      }
    }

    this.#desiredAreas = desiredAreas;
  }

  async #loadMap() {
    const mapPath = `${this.#mapDir}/${this.#mapName}.wdt`;
    this.#map = await this.#formatManager.get(mapPath, Map);
  }

  #getArea(areaId: number) {
    const loaded = this.#loadedAreas.get(areaId);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loadingAreas.get(areaId);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#loadArea(areaId);
    this.#loadingAreas.set(areaId, loading);

    return loading;
  }

  async #loadArea(areaId: number) {
    const { areaX, areaY } = this.#getAreaIndex(areaId);
    const areaPath = `${this.#mapDir}/${this.#mapName}_${areaY}_${areaX}.adt`;
    const area = await this.#formatManager.get(areaPath, MapArea, this.#map.layerSplatDepth);

    this.#loadedAreas.set(areaId, area);
    this.#loadingAreas.delete(areaId);

    return area;
  }
}

export default MapManager;
export { MapManager };
