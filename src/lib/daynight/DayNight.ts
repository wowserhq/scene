import * as THREE from 'three';
import { SUN_PHI_TABLE, SUN_THETA_TABLE } from './table.js';
import { interpolateDayNightTable } from './util.js';

class DayNight {
  #dayProgression = 0.0;

  #sunDir = new THREE.Vector3();
  #sunDirView = new THREE.Vector3();

  #uniforms = {
    sunDir: { value: this.#sunDirView },
  };

  constructor() {}

  get dayProgression() {
    return this.#dayProgression;
  }

  set dayProgression(dayProgression: number) {
    this.#dayProgression = dayProgression;
  }

  get uniforms() {
    return this.#uniforms;
  }

  update(camera: THREE.Camera) {
    this.#updateSunDirection();

    const viewMatrix = camera.matrixWorldInverse;
    this.#sunDirView.copy(this.#sunDir).transformDirection(viewMatrix).normalize();
  }

  #updateSunDirection() {
    // Get spherical coordinates
    const phi = interpolateDayNightTable(SUN_PHI_TABLE, this.#dayProgression);
    const theta = interpolateDayNightTable(SUN_THETA_TABLE, this.#dayProgression);

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
