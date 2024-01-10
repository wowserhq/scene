import * as THREE from 'three';
import { SUN_PHI_TABLE, SUN_THETA_TABLE } from './table.js';
import { getDayNightTime, interpolateDayNightTable } from './util.js';

class DayNight {
  // Time in half-minutes since midnight (0 - 2879)
  #time = 0;

  // Overridden time in half-minutes since midnight (0 - 2879)
  #timeOverride = null;

  // Time as a floating point range from 0.0 to 1.0
  #timeProgression = 0.0;

  #sunDir = new THREE.Vector3();

  constructor() {}

  get sunDir() {
    return this.#sunDir;
  }

  get time() {
    return this.#time;
  }

  get timeOverride() {
    return this.#timeOverride;
  }

  get timeProgression() {
    return this.#timeProgression;
  }

  setTimeOverride(override: number) {
    this.#timeOverride = override;
    this.#updateTime();
  }

  clearTimeOverride() {
    this.#timeOverride = null;
    this.#updateTime();
  }

  update() {
    this.#updateTime();
    this.#updateSunDirection();
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
    const phi = interpolateDayNightTable(SUN_PHI_TABLE, this.#timeProgression);
    const theta = interpolateDayNightTable(SUN_THETA_TABLE, this.#timeProgression);

    // Convert from spherical coordinates to XYZ
    // x = rho * sin(phi) * cos(theta)
    // y = rho * sin(phi) * sin(theta)
    // z = rho * cos(phi)

    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const x = sinPhi * Math.cos(theta);
    const y = sinPhi * Math.sin(theta);
    const z = cosPhi;

    this.#sunDir.set(x, y, z);
  }
}

export default DayNight;
export { DayNight };
