import * as THREE from 'three';
import { Map, MAP_CHUNK_HEIGHT, MAP_AREA_COUNT_Y } from '@wowserhq/format';
import TerrainManager from './terrain/TerrainManager.js';
import TextureManager from '../texture/TextureManager.js';
import DoodadManager from './DoodadManager.js';
import { AssetHost } from '../asset.js';
import MapLoader from './loader/MapLoader.js';
import { MapAreaSpec, MapSpec } from './loader/types.js';
import MapLight from './light/MapLight.js';
import DbManager from '../db/DbManager.js';

const DEFAULT_VIEW_DISTANCE = 1277.0;
const EFFECTIVE_VIEW_DISTANCE_EXTENSION = 100.0;

type MapManagerOptions = {
  host: AssetHost;
  textureManager?: TextureManager;
  dbManager?: DbManager;
  viewDistance?: number;
};

class MapManager {
  #mapName: string;
  #mapDir: string;
  #map: MapSpec;

  #loader: MapLoader;
  #loadingAreas = new globalThis.Map<number, Promise<MapAreaSpec>>();
  #loadedAreas = new globalThis.Map<number, MapAreaSpec>();

  #root: THREE.Group;
  #terrainGroups = new globalThis.Map<number, THREE.Group>();
  #doodadGroups = new globalThis.Map<number, THREE.Group>();

  #textureManager: TextureManager;
  #terrainManager: TerrainManager;
  #doodadManager: DoodadManager;
  #dbManager: DbManager;

  #mapLight: MapLight;

  #target = new THREE.Vector2();
  #targetAreaX: number;
  #targetAreaY: number;
  #targetChunkX: number;
  #targetChunkY: number;

  #viewDistance = DEFAULT_VIEW_DISTANCE;
  #effectiveViewDistance = this.#viewDistance;
  #projScreenMatrix = new THREE.Matrix4();
  #cameraFrustum = new THREE.Frustum();

  #desiredAreas = new Set<number>();

  constructor(options: MapManagerOptions) {
    if (options.viewDistance) {
      this.#viewDistance = options.viewDistance;
    }

    this.#textureManager = options.textureManager ?? new TextureManager({ host: options.host });
    this.#dbManager = options.dbManager ?? new DbManager({ host: options.host });
    this.#loader = new MapLoader({ host: options.host });

    this.#mapLight = new MapLight({ dbManager: this.#dbManager });

    this.#terrainManager = new TerrainManager({
      host: options.host,
      textureManager: this.#textureManager,
      mapLight: this.#mapLight,
    });
    this.#doodadManager = new DoodadManager({
      host: options.host,
      textureManager: this.#textureManager,
      mapLight: this.#mapLight,
    });

    this.#root = new THREE.Group();
    this.#root.matrixAutoUpdate = false;
    this.#root.matrixWorldAutoUpdate = false;
  }

  get clearColor() {
    return this.#mapLight.fogColor;
  }

  get mapMame() {
    return this.#mapName;
  }

  get root() {
    return this.#root;
  }

  load(mapName: string, mapId?: number) {
    this.#mapName = mapName;
    this.#mapDir = `world/maps/${mapName}`;

    this.#mapLight.mapId = mapId;

    this.#root.name = `map:${mapName}`;

    this.#loadMap().catch((error) => console.error(error));
    this.#syncAreas().catch((error) => console.error(error));

    return this;
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
    this.#mapLight.update(camera);

    // If fog end is closer than the configured view distance, use the fog end plus extension as
    // the effective view distance
    this.#effectiveViewDistance = Math.min(
      this.#mapLight.fogEnd + EFFECTIVE_VIEW_DISTANCE_EXTENSION,
      this.#viewDistance,
    );

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

    // Doodad groups
    for (const doodadGroup of this.#doodadGroups.values()) {
      doodadGroup.visible = this.#cameraFrustum.intersectsSphere(
        doodadGroup.userData.boundingSphere,
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

      const doodadGroup = this.#doodadGroups.get(areaId);
      if (doodadGroup) {
        this.#root.remove(doodadGroup);
        this.#doodadGroups.delete(areaId);
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

      const [terrainGroup, doodadGroup] = await Promise.all([
        this.#terrainManager.getArea(areaId, newArea),
        this.#doodadManager.getArea(newArea),
      ]);

      const terrainBoundingSphere = new THREE.Box3()
        .setFromObject(terrainGroup)
        .getBoundingSphere(new THREE.Sphere());
      terrainGroup.userData.boundingSphere = terrainBoundingSphere;

      this.#terrainGroups.set(areaId, terrainGroup);
      this.#root.add(terrainGroup);

      const doodadBoundingSphere = new THREE.Box3()
        .setFromObject(doodadGroup)
        .getBoundingSphere(new THREE.Sphere());
      doodadGroup.userData.boundingSphere = doodadBoundingSphere;

      this.#doodadGroups.set(areaId, doodadGroup);
      this.#root.add(doodadGroup);
    }

    requestAnimationFrame(() => this.#syncAreas().catch((error) => console.error(error)));
  }

  #getChunkRadius() {
    return this.#effectiveViewDistance / MAP_CHUNK_HEIGHT;
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
    this.#map = await this.#loader.loadMapSpec(mapPath);
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

    const mapPath = `${this.#mapDir}/${this.#mapName}.wdt`;
    const areaPath = `${this.#mapDir}/${this.#mapName}_${areaY}_${areaX}.adt`;
    const areaSpec = await this.#loader.loadAreaSpec(mapPath, areaPath);

    this.#loadedAreas.set(areaId, areaSpec);
    this.#loadingAreas.delete(areaId);

    return areaSpec;
  }
}

export default MapManager;
export { MapManager };
