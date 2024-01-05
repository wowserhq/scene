import * as THREE from 'three';
import { M2_MATERIAL_BLEND } from '@wowserhq/format';
import { M2_MATERIAL_BLEND_TO_THREE_BLEND, M2_MATERIAL_PASS } from './const.js';
import { THREE_BLEND_STATE } from '../blend.js';

const DEFAULT_BLEND: M2_MATERIAL_BLEND = M2_MATERIAL_BLEND.BLEND_OPAQUE;
const DEFAULT_PASS: M2_MATERIAL_PASS = M2_MATERIAL_PASS.PASS_0;
const DEFAULT_SIDE: THREE.Side = THREE.FrontSide;
const DEFAULT_ALPHA: number = 1.0;

const getThreeBlendState = (blend: M2_MATERIAL_BLEND, pass: M2_MATERIAL_PASS) =>
  THREE_BLEND_STATE[M2_MATERIAL_BLEND_TO_THREE_BLEND[pass][blend]];

class ModelMaterial extends THREE.RawShaderMaterial {
  #blend: M2_MATERIAL_BLEND;
  #pass: M2_MATERIAL_PASS;

  #alphaRef: number;
  #alpha: number;

  constructor(
    vertexShader: string,
    fragmentShader: string,
    textures: THREE.Texture[],
    blend = DEFAULT_BLEND,
    pass = DEFAULT_PASS,
    side = DEFAULT_SIDE,
  ) {
    super();

    this.#blend = blend;
    this.#pass = pass;

    this.alpha = DEFAULT_ALPHA;

    this.uniforms = {
      textures: { value: textures },
      alphaRef: { value: this.#alphaRef },
      fogColor: { value: new THREE.Color(0.25, 0.5, 0.8) },
      fogParams: { value: new THREE.Vector3(0.0, 1066.0, 1.0) },
    };

    this.glslVersion = THREE.GLSL3;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.side = side;

    const threeBlendState = getThreeBlendState(this.#blend, this.#pass);
    const { blending, blendSrc, blendSrcAlpha, blendDst, blendDstAlpha } = threeBlendState;

    this.blending = blending;
    this.blendSrc = blendSrc;
    this.blendSrcAlpha = blendSrcAlpha;
    this.blendDst = blendDst;
    this.blendDstAlpha = blendDstAlpha;
  }

  get alphaRef() {
    return this.#alphaRef;
  }

  get alpha() {
    return this.#alpha;
  }

  set alpha(alpha: number) {
    this.#alpha = alpha;

    // Opaque - keep all pixels, regardless of alpha
    // Alpha key - scale pixel test by alpha
    // Other - keep all pixels that aren't fully transparent
    if (this.#blend === M2_MATERIAL_BLEND.BLEND_OPAQUE) {
      this.#alphaRef = 0.0;
    } else if (this.#blend === M2_MATERIAL_BLEND.BLEND_ALPHA_KEY) {
      this.#alphaRef = alpha * (224.0 / 255.0);
    } else {
      this.#alphaRef = 1.0 / 255.0;
    }
  }
}

export default ModelMaterial;
