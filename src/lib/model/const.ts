import { THREE_BLEND } from '../blend.js';

enum M2_MATERIAL_PASS {
  PASS_0 = 0,
  PASS_1,
  PASS_COUNT,
}

const M2_MATERIAL_BLEND_TO_THREE_BLEND = {
  [M2_MATERIAL_PASS.PASS_0]: [
    THREE_BLEND.BLEND_OPAQUE,
    THREE_BLEND.BLEND_ALPHA_KEY,
    THREE_BLEND.BLEND_ALPHA,
    THREE_BLEND.BLEND_NO_ALPHA_ADD,
    THREE_BLEND.BLEND_ADD,
    THREE_BLEND.BLEND_MOD,
    THREE_BLEND.BLEND_MOD2X,
  ],
  [M2_MATERIAL_PASS.PASS_1]: [
    THREE_BLEND.BLEND_ALPHA,
    THREE_BLEND.BLEND_ALPHA,
    THREE_BLEND.BLEND_ALPHA,
    THREE_BLEND.BLEND_NO_ALPHA_ADD,
    THREE_BLEND.BLEND_ADD,
    THREE_BLEND.BLEND_MOD,
    THREE_BLEND.BLEND_MOD2X,
  ],
};

export { M2_MATERIAL_PASS, M2_MATERIAL_BLEND_TO_THREE_BLEND };
