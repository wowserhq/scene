import * as THREE from 'three';
import { MapArea } from '@wowserhq/format';
import ModelManager from '../model/ModelManager.js';
import FormatManager from '../FormatManager.js';
import TextureManager from '../texture/TextureManager.js';

class DoodadManager {
  #modelManager: ModelManager;

  constructor(formatManager: FormatManager, textureManager: TextureManager) {
    this.#modelManager = new ModelManager(formatManager, textureManager);
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
