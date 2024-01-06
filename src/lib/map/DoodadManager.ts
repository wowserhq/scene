import * as THREE from 'three';
import { MapArea } from '@wowserhq/format';
import ModelManager from '../model/ModelManager.js';
import TextureManager from '../texture/TextureManager.js';
import { AssetHost } from '../asset.js';

type DoodadManagerOptions = {
  host: AssetHost;
  textureManager?: TextureManager;
};

class DoodadManager {
  #host: AssetHost;
  #modelManager: ModelManager;

  constructor(options: DoodadManagerOptions) {
    this.#host = options.host;

    this.#modelManager = new ModelManager({
      host: options.host,
      textureManager: options.textureManager,
    });
  }

  async getArea(area: MapArea) {
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

    return group;
  }
}

export default DoodadManager;
