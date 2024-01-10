import * as THREE from 'three';

class SceneLight {
  #sunDir = new THREE.Vector3();
  #sunDirView = new THREE.Vector3();

  #uniforms = {
    sunDir: {
      value: this.#sunDirView,
    },
  };

  get uniforms() {
    return this.#uniforms;
  }

  setSunDir(dir: THREE.Vector3) {
    this.#sunDir.copy(dir);
  }

  update(camera: THREE.Camera) {
    const viewMatrix = camera.matrixWorldInverse;
    this.#sunDirView.copy(this.#sunDir).transformDirection(viewMatrix).normalize();
  }
}

export default SceneLight;
export { SceneLight };
