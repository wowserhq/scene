import * as THREE from 'three';

enum THREE_BLEND_MODE {
  BLEND_OPAQUE = 0,
  BLEND_ALPHA_KEY,
  BLEND_ALPHA,
  BLEND_NO_ALPHA_ADD,
  BLEND_ADD,
  BLEND_MOD,
  BLEND_MOD2X,
}

const THREE_BLEND_STATE = {
  [THREE_BLEND_MODE.BLEND_OPAQUE]: {
    blending: THREE.NoBlending,
    blendSrc: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDst: THREE.ZeroFactor,
    blendDstAlpha: THREE.ZeroFactor,
  },
  [THREE_BLEND_MODE.BLEND_ALPHA_KEY]: {
    blending: THREE.NoBlending,
    blendSrc: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDst: THREE.ZeroFactor,
    blendDstAlpha: THREE.ZeroFactor,
  },
  [THREE_BLEND_MODE.BLEND_ALPHA]: {
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  },
  [THREE_BLEND_MODE.BLEND_NO_ALPHA_ADD]: {
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDst: THREE.OneFactor,
    blendDstAlpha: THREE.OneFactor,
  },
  [THREE_BLEND_MODE.BLEND_ADD]: {
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDst: THREE.OneFactor,
    blendDstAlpha: THREE.OneFactor,
  },
  [THREE_BLEND_MODE.BLEND_MOD]: {
    blending: THREE.CustomBlending,
    blendSrc: THREE.DstColorFactor,
    blendSrcAlpha: THREE.DstAlphaFactor,
    blendDst: THREE.ZeroFactor,
    blendDstAlpha: THREE.ZeroFactor,
  },
  [THREE_BLEND_MODE.BLEND_MOD2X]: {
    blending: THREE.CustomBlending,
    blendSrc: THREE.DstColorFactor,
    blendSrcAlpha: THREE.DstAlphaFactor,
    blendDst: THREE.SrcColorFactor,
    blendDstAlpha: THREE.SrcAlphaFactor,
  },
};

export { THREE_BLEND_MODE, THREE_BLEND_STATE };
