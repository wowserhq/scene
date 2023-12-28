import * as THREE from 'three';
import { fragmentShader, vertexShader } from './shaders.js';

class TerrainMaterial extends THREE.RawShaderMaterial {
  constructor(layerCount: number, layerTextures: THREE.Texture[], splatTexture: THREE.Texture) {
    super();

    this.uniforms = {
      layerCount: { value: layerCount },
      layers: { value: layerTextures },
      splat: { value: splatTexture },
      fogColor: { value: new THREE.Color(0.25, 0.5, 0.8) },
      fogParams: { value: new THREE.Vector3(0.0, 1066.0, 1.0) },
    };

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.glslVersion = THREE.GLSL3;
    this.side = THREE.FrontSide;
    this.blending = 0;
  }
}

export default TerrainMaterial;
export { TerrainMaterial };
