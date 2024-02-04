import * as THREE from 'three';
import ModelManager from '../model/ModelManager.js';
import TextureManager from '../texture/TextureManager.js';
import { AssetHost } from '../asset.js';
import { MapAreaSpec, MapDoodadDefSpec } from './loader/types.js';
import MapLight from './light/MapLight.js';
import Model from '../model/Model.js';
import { getFade } from '../world.js';

type DoodadManagerOptions = {
  host: AssetHost;
  textureManager?: TextureManager;
  mapLight: MapLight;
};

class DoodadManager {
  #host: AssetHost;
  #modelManager: ModelManager;

  #loadingAreas = new Map<number, Promise<THREE.Group>>();
  #loadedAreas = new Map<number, THREE.Group>();
  #areaBounds = new Map<number, THREE.Sphere>();

  #doodads = new Map<number, Model>();
  #doodadDefs = new Map<number, MapDoodadDefSpec[]>();
  #doodadRefs = new Map<number, number>();

  constructor(options: DoodadManagerOptions) {
    this.#host = options.host;

    this.#modelManager = new ModelManager({
      host: options.host,
      textureManager: options.textureManager,
      sceneLight: options.mapLight,
    });
  }

  cull(cullingFrustum: THREE.Frustum, cameraPosition: THREE.Vector3) {
    for (const [areaId, areaGroup] of this.#loadedAreas.entries()) {
      const areaBounds = this.#areaBounds.get(areaId);
      const areaVisible = cullingFrustum.intersectsSphere(areaBounds);

      areaGroup.visible = areaVisible;

      for (const doodad of areaGroup.children as Model[]) {
        const distance = cameraPosition.distanceTo(doodad.position);
        const fade = getFade(distance, doodad.sizeCategory);

        const doodadVisible =
          areaVisible && fade > 0.0 && cullingFrustum.intersectsSphere(doodad.boundingSphereWorld);

        if (doodadVisible) {
          doodad.show();
          doodad.alpha = fade;
        } else {
          doodad.hide();
        }
      }
    }
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
    this.#areaBounds.delete(areaId);
    this.#loadedAreas.delete(areaId);

    // Dereference doodads
    for (const doodadDef of this.#doodadDefs.get(areaId)) {
      if (this.#derefDoodad(doodadDef.id) === 0) {
        const model = this.#doodads.get(doodadDef.id);
        model.dispose();

        this.#doodads.delete(doodadDef.id);
      }
    }

    this.#doodadDefs.delete(areaId);
  }

  update(deltaTime: number) {
    this.#modelManager.update(deltaTime);
  }

  #refDoodad(refId: number) {
    let refCount = this.#doodadRefs.get(refId) || 0;

    refCount++;

    this.#doodadRefs.set(refId, refCount);

    return refCount;
  }

  #derefDoodad(refId: number) {
    let refCount = this.#doodadRefs.get(refId);

    // Unknown ref

    if (refCount === undefined) {
      return;
    }

    // Decrement

    refCount--;

    if (refCount > 0) {
      this.#doodadRefs.set(refId, refCount);
      return refCount;
    }

    // Last reference

    this.#doodadRefs.delete(refId);

    return 0;
  }

  async #loadArea(areaId: number, area: MapAreaSpec) {
    this.#doodadDefs.set(areaId, area.doodadDefs);

    // Only load newly referenced doodad defs (defs can be shared across multiple areas)
    const doodadDefs = area.doodadDefs.filter((doodadDef) => this.#refDoodad(doodadDef.id) === 1);

    const areaGroup = new THREE.Group();
    areaGroup.name = 'doodads';

    const areaBoundingBox = new THREE.Box3();

    const doodadModels = await Promise.all(
      doodadDefs.map((doodadDef) => this.#modelManager.get(doodadDef.name)),
    );

    for (let i = 0; i < doodadDefs.length; i++) {
      const model = doodadModels[i];
      const def = doodadDefs[i];

      // We handle doodad culling ourselves
      model.frustumCulled = false;

      model.position.set(def.position[0], def.position[1], def.position[2]);
      model.quaternion.set(def.rotation[0], def.rotation[1], def.rotation[2], def.rotation[3]);

      // Def scale is on all axes and is a fixed precision value
      model.scale.setScalar(def.scale / 1024);

      model.updateMatrixWorld();

      areaGroup.add(model);
      areaBoundingBox.expandByObject(model);

      this.#doodads.set(def.id, model);
    }

    const areaBounds = areaBoundingBox.getBoundingSphere(new THREE.Sphere());
    this.#areaBounds.set(areaId, areaBounds);

    this.#loadedAreas.set(areaId, areaGroup);
    this.#loadingAreas.delete(areaId);

    return areaGroup;
  }
}

export default DoodadManager;
