import * as THREE from 'three';
import { BLEND_MODE, BLEND_STATE } from '../blend.js';

class ModelMaterial extends THREE.RawShaderMaterial {
  constructor(
    vertexShader: string,
    fragmentShader: string,
    textures: THREE.Texture[],
    blendMode: BLEND_MODE = BLEND_MODE.BLEND_OPAQUE,
    side: THREE.Side = THREE.FrontSide,
  ) {
    super();

    const alphaRef = blendMode === BLEND_MODE.BLEND_ALPHA_KEY ? 224 / 255 : 1 / 255;

    this.uniforms = {
      textures: { value: textures },
      alphaRef: { value: alphaRef },
    };

    this.glslVersion = THREE.GLSL3;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    const { blending, blendSrc, blendSrcAlpha, blendDst, blendDstAlpha } = BLEND_STATE[blendMode];
    this.blending = blending;
    this.blendSrc = blendSrc;
    this.blendSrcAlpha = blendSrcAlpha;
    this.blendDst = blendDst;
    this.blendDstAlpha = blendDstAlpha;

    this.side = side;
  }
}

export default ModelMaterial;
