import * as THREE from 'three';
import ModelManager from '../model/ModelManager.js';
import TextureManager from '../texture/TextureManager.js';
import { AssetHost } from '../asset.js';
import { MapAreaSpec } from './loader/types.js';
import MapLight from './light/MapLight.js';
import Model from '../model/Model.js';

type DoodadManagerOptions = {
  host: AssetHost;
  textureManager?: TextureManager;
  mapLight: MapLight;
};

class DoodadManager {
  #host: AssetHost;
  #modelManager: ModelManager;

  #loadedAreas = new Map<number, THREE.Group>();
  #loadingAreas = new Map<number, Promise<THREE.Group>>();

  constructor(options: DoodadManagerOptions) {
    this.#host = options.host;

    this.#modelManager = new ModelManager({
      host: options.host,
      textureManager: options.textureManager,
      sceneLight: options.mapLight,
    });
  }

  getArea(areaId: number, area: MapAreaSpec): Promise<THREE.Group> {
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

    for (const model of group.children) {
      (model as Model).dispose();
    }

    this.#loadedAreas.delete(areaId);
  }

  update(deltaTime: number) {
    this.#modelManager.update(deltaTime);
  }

  async #loadArea(areaId: number, area: MapAreaSpec) {
    const group = new THREE.Group();
    group.name = 'doodads';

    const doodadDefs = area.doodadDefs;

    const doodadModels = await Promise.all(
      doodadDefs.map((doodadDef) => this.#modelManager.get(doodadDef.name)),
    );

    for (let i = 0; i < doodadDefs.length; i++) {
      const model = doodadModels[i];
      const def = doodadDefs[i];

      model.position.set(def.position[0], def.position[1], def.position[2]);
      model.quaternion.set(def.rotation[0], def.rotation[1], def.rotation[2], def.rotation[3]);

      // Def scale is on all axes and is a fixed precision value
      model.scale.setScalar(def.scale / 1024);

      model.updateMatrixWorld();

      group.add(model);
    }

    this.#loadedAreas.set(areaId, group);
    this.#loadingAreas.delete(areaId);

    return group;
  }
}

export default DoodadManager;
