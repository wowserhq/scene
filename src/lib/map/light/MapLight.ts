import * as THREE from 'three';
import {
  LightFloatBandRecord,
  LightIntBandRecord,
  LightParamsRecord,
  LightRecord,
  MAP_CORNER_X,
  MAP_CORNER_Y,
} from '@wowserhq/format';
import { getDayNightTime, interpolateColorTable, interpolateNumericTable } from './util.js';
import { SUN_PHI_TABLE, SUN_THETA_TABLE } from './table.js';
import { LIGHT_FLOAT_BAND, LIGHT_INT_BAND, LIGHT_PARAM } from './const.js';
import { getAreaLightsFromDb } from './db.js';
import { AreaLight } from './types.js';
import SceneLight from '../../light/SceneLight.js';
import DbManager from '../../db/DbManager.js';

type MapLightOptions = {
  dbManager: DbManager;
};

class MapLight extends SceneLight {
  #dbManager: DbManager;

  // Area lights indexed by map id
  #lights: Record<number, AreaLight[]>;

  // Applicable area lights given current camera position
  #selectedLights: AreaLight[];

  // Time in half-minutes since midnight (0 - 2879)
  #time = 0;

  // Overridden time in half-minutes since midnight (0 - 2879)
  #timeOverride = null;

  // Time as a floating point range from 0.0 to 1.0
  #timeProgression = 0.0;

  // Used to filter area lights into the set appropriate for the given map
  #mapId: number;

  constructor(options: MapLightOptions) {
    super();

    this.#dbManager = options.dbManager;

    this.#loadLights().catch((error) => console.error(error));
  }

  get mapId() {
    return this.#mapId;
  }

  set mapId(mapId: number) {
    this.#mapId = mapId;
  }

  get time() {
    return this.#time;
  }

  get timeOverride() {
    return this.#timeOverride;
  }

  set timeOverride(override: number) {
    this.#timeOverride = override;
    this.#updateTime();
  }

  update(camera: THREE.Camera) {
    this.#selectLights(camera.position);

    this.#updateTime();
    this.#updateSunDirection();
    this.#updateColors();
    this.#updateFog();

    super.update(camera);
  }

  #updateTime() {
    if (this.#timeOverride) {
      this.#time = this.#timeOverride;
    } else {
      this.#time = getDayNightTime();
    }

    this.#timeProgression = this.#time / 2880;
  }

  #updateSunDirection() {
    // Get spherical coordinates
    const phi = interpolateNumericTable(SUN_PHI_TABLE, this.#timeProgression);
    const theta = interpolateNumericTable(SUN_THETA_TABLE, this.#timeProgression);

    // Convert from spherical coordinates to XYZ
    // x = rho * sin(phi) * cos(theta)
    // y = rho * sin(phi) * sin(theta)
    // z = rho * cos(phi)

    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const x = sinPhi * Math.cos(theta);
    const y = sinPhi * Math.sin(theta);
    const z = cosPhi;

    this.sunDir.set(x, y, z);
  }

  #updateColors() {
    if (!this.#selectedLights || this.#selectedLights.length === 0) {
      return;
    }

    const light = this.#selectedLights[0];
    const params = light.params[LIGHT_PARAM.PARAM_STANDARD];

    interpolateColorTable(
      params.intBands[LIGHT_INT_BAND.BAND_DIRECT_COLOR],
      this.#timeProgression,
      this.sunDiffuseColor,
    );

    interpolateColorTable(
      params.intBands[LIGHT_INT_BAND.BAND_AMBIENT_COLOR],
      this.#timeProgression,
      this.sunAmbientColor,
    );
  }

  #updateFog() {
    if (!this.#selectedLights || this.#selectedLights.length === 0) {
      return;
    }

    const light = this.#selectedLights[0];
    const params = light.params[LIGHT_PARAM.PARAM_STANDARD];

    interpolateColorTable(
      params.intBands[LIGHT_INT_BAND.BAND_SKY_FOG_COLOR],
      this.#timeProgression,
      this.fogColor,
    );

    const fogEnd = interpolateNumericTable(
      params.floatBands[LIGHT_FLOAT_BAND.BAND_FOG_END],
      this.#timeProgression,
    );

    const fogStartScalar = interpolateNumericTable(
      params.floatBands[LIGHT_FLOAT_BAND.BAND_FOG_START_SCALAR],
      this.#timeProgression,
    );

    const fogStart = fogStartScalar * fogEnd;

    // TODO conditionally calculate fog rate (aka density)

    this.fogParams.set(fogStart, fogEnd, 1.0, 1.0);
  }

  #selectLights(position: THREE.Vector3) {
    if (!this.#lights || this.#mapId === undefined) {
      return;
    }

    const selectedLights = [];

    // Find lights with falloff radii overlapping position
    for (const light of this.#lights[this.#mapId]) {
      const distance = position.distanceTo(light.position);

      if (distance <= light.falloffEnd) {
        selectedLights.push(light);
      }
    }

    // Find default light if no other lights were in range
    if (selectedLights.length === 0) {
      for (const light of this.#lights[this.#mapId]) {
        if (
          light.position.x === MAP_CORNER_X &&
          light.position.y === MAP_CORNER_Y &&
          light.falloffEnd === 0.0
        ) {
          selectedLights.push(light);
          break;
        }
      }
    }

    this.#selectedLights = selectedLights;
  }

  async #loadLights() {
    const lightDb = await this.#dbManager.get('Light.dbc', LightRecord);
    const lightParamsDb = await this.#dbManager.get('LightParams.dbc', LightParamsRecord);
    const lightIntBandDb = await this.#dbManager.get('LightIntBand.dbc', LightIntBandRecord);
    const lightFloatBandDb = await this.#dbManager.get('LightFloatBand.dbc', LightFloatBandRecord);

    this.#lights = getAreaLightsFromDb(lightDb, lightParamsDb, lightIntBandDb, lightFloatBandDb);
  }
}

export default MapLight;
export { MapLight };
