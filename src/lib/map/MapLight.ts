import * as THREE from 'three';
import DayNight from './daynight/DayNight.js';
import SceneLight from '../light/SceneLight.js';

class MapLight extends SceneLight {
  #dayNight = new DayNight();

  update(camera: THREE.Camera) {
    this.#dayNight.update();

    this.setSunDir(this.#dayNight.sunDir);

    super.update(camera);
  }
}

export default MapLight;
export { MapLight };
