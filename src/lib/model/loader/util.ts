import { M2_TEXTURE_COMBINER, M2_TEXTURE_COORD } from '@wowserhq/format';
import { MODEL_SHADER_FRAGMENT, MODEL_SHADER_VERTEX } from '../types.js';

const getVertexShader = (coords: M2_TEXTURE_COORD[]): MODEL_SHADER_VERTEX => {
  if (coords.length === 0) {
    return MODEL_SHADER_VERTEX.VERTEX_UNKNOWN;
  }

  if (coords.length === 1) {
    switch (coords[0]) {
      case M2_TEXTURE_COORD.COORD_T1:
        return MODEL_SHADER_VERTEX.VERTEX_T1;
      case M2_TEXTURE_COORD.COORD_T2:
        return MODEL_SHADER_VERTEX.VERTEX_T2;
      case M2_TEXTURE_COORD.COORD_ENV:
        return MODEL_SHADER_VERTEX.VERTEX_ENV;
    }
  }

  return MODEL_SHADER_VERTEX.VERTEX_UNKNOWN;
};

const getFragmentShader = (combiners: M2_TEXTURE_COMBINER[]): MODEL_SHADER_FRAGMENT => {
  if (combiners.length === 0) {
    return MODEL_SHADER_FRAGMENT.FRAGMENT_UNKNOWN;
  }

  if (combiners.length === 1) {
    switch (combiners[0]) {
      case M2_TEXTURE_COMBINER.COMBINER_OPAQUE:
        return MODEL_SHADER_FRAGMENT.FRAGMENT_OPAQUE;
      case M2_TEXTURE_COMBINER.COMBINER_MOD:
        return MODEL_SHADER_FRAGMENT.FRAGMENT_MOD;
    }
  }

  return MODEL_SHADER_FRAGMENT.FRAGMENT_UNKNOWN;
};

export { getVertexShader, getFragmentShader };
