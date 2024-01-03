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

    for (const doodadDef of area.doodadDefs) {
      const model = await this.#modelManager.get(doodadDef.name);

      model.position.set(
        doodadDef.mapPosition[0],
        doodadDef.mapPosition[1],
        doodadDef.mapPosition[2],
      );

      // Def rotation is in degrees
      model.rotation.set(
        doodadDef.mapRotation[0] * DEG2RAD,
        doodadDef.mapRotation[1] * DEG2RAD,
        doodadDef.mapRotation[2] * DEG2RAD,
      );

      // Def scale is on all axes and is a fixed precision value
      model.scale.setScalar(doodadDef.scale / 1024);

      model.updateMatrixWorld();

      group.add(model);
    }

    return group;
  }
}

export default DoodadManager;
