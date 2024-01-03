import * as THREE from 'three';
import { MapArea } from '@wowserhq/format';
import ModelManager from '../model/ModelManager.js';
import FormatManager from '../FormatManager.js';
import TextureManager from '../texture/TextureManager.js';

const DEG2RAD = Math.PI / 180;

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

      model.position.set(def.mapPosition[0], def.mapPosition[1], def.mapPosition[2]);

      // Def rotation is in degrees
      model.rotation.set(
        def.mapRotation[0] * DEG2RAD,
        def.mapRotation[1] * DEG2RAD,
        def.mapRotation[2] * DEG2RAD,
      );

      // Def scale is on all axes and is a fixed precision value
      model.scale.setScalar(def.scale / 1024);

      model.updateMatrixWorld();

      group.add(model);
    }

    return group;
  }
}

export default DoodadManager;
