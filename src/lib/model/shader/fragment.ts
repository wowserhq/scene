import { MODEL_SHADER_FRAGMENT } from '../types.js';
import { VARIABLE_FOG_FACTOR, FUNCTION_APPLY_FOG, UNIFORM_FOG_COLOR } from '../../shader/fog.js';
import { composeShader } from '../../shader/util.js';

const FRAGMENT_SHADER_PRECISION = 'highp float';

const FRAGMENT_SHADER_UNIFORMS = [
  { name: 'textures[2]', type: 'sampler2D' },
  { name: 'alphaRef', type: 'float' },
  { name: 'sunDiffuseColor', type: 'vec3' },
  { name: 'sunAmbientColor', type: 'vec3' },
];

const FRAGMENT_SHADER_INPUTS = [{ name: 'vLight', type: 'float' }];

const FRAGMENT_SHADER_OUTPUTS = [{ name: 'color', type: 'vec4' }];

const FRAGMENT_SHADER_FUNCTIONS = [];

const FRAGMENT_SHADER_COMBINERS = `
void combine_opaque(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb * tex0.rgb;
}

void combine_add(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb + tex0.rgb;
  color.a = color.a + tex0.a;
}

void combine_decal(inout vec4 color, in vec4 tex0) {
  color.rgb = mix(color.rgb, tex0.rgb, color.a);
}

void combine_fade(inout vec4 color, in vec4 tex0) {
  color.rgb = mix(tex0.rgb, color.rgb, color.a);
}

void combine_mod(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb * tex0.rgb;
  color.a = color.a * tex0.a;
}

void combine_mod2x(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb * tex0.rgb * 2.0;
  color.a = color.a * tex0.a * 2.0;
}

void combine_opaque_add(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + tex1.rgb;
  color.a = color.a + tex1.a;
}

void combine_opaque_addalpha(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + (tex1.rgb * tex1.a);
}

void combine_opaque_addalpha_alpha(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + (tex1.rgb * tex1.a * tex0.a);
}

void combine_opaque_addna(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + tex1.rgb;
}

void combine_opaque_mod(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) * tex1.rgb;
  color.a = color.a * tex1.a;
}

void combine_opaque_mod2x(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) * tex1.rgb * 2.0;
  color.a = color.a * tex1.a * 2.0;
}
`;

const FRAGMENT_SHADER_MAIN_ALPHATEST = `
// Alpha test
if (color.a < alphaRef) {
  discard;
}
`;

const FRAGMENT_SHADER_MAIN_LIGHTING = `
color.rgb *= sunDiffuseColor * vLight + sunAmbientColor;
`;

const FRAGMENT_SHADER_MAIN_FOG = `
// Apply fog
applyFog(color, ${UNIFORM_FOG_COLOR.name}, ${VARIABLE_FOG_FACTOR.name});
`;

const createFragmentShader = (textureCount: number, combineFunction: string) => {
  // Precision

  const precision = FRAGMENT_SHADER_PRECISION;

  // Uniforms

  const uniforms = FRAGMENT_SHADER_UNIFORMS.slice(0);

  uniforms.push(UNIFORM_FOG_COLOR);

  // Inputs

  const inputs = FRAGMENT_SHADER_INPUTS.slice(0);

  if (textureCount === 1) {
    inputs.push({ name: 'vTexCoord1', type: 'vec2' });
  } else if (textureCount === 2) {
    inputs.push({ name: 'vTexCoord1', type: 'vec2' });
    inputs.push({ name: 'vTexCoord2', type: 'vec2' });
  }

  inputs.push(VARIABLE_FOG_FACTOR);

  // Outputs

  const outputs = FRAGMENT_SHADER_OUTPUTS.slice(0);

  // Functions

  const functions = FRAGMENT_SHADER_FUNCTIONS.slice(0);

  functions.push(FUNCTION_APPLY_FOG);
  functions.push(FRAGMENT_SHADER_COMBINERS);

  // Main

  const main = [];

  main.push(`color.rgba = vec4(1.0, 1.0, 1.0, 1.0);`);

  if (textureCount === 1) {
    main.push(`vec4 tex0 = texture(textures[0], vTexCoord1);`);
    main.push(`${combineFunction}(color, tex0);`);
  } else if (textureCount === 2) {
    main.push(`vec4 tex0 = texture(textures[0], vTexCoord1);`);
    main.push(`vec4 tex1 = texture(textures[1], vTexCoord2);`);
    main.push(`${combineFunction}(color, tex0, tex1);`);
  }

  main.push(FRAGMENT_SHADER_MAIN_ALPHATEST);
  main.push(FRAGMENT_SHADER_MAIN_LIGHTING);
  main.push(FRAGMENT_SHADER_MAIN_FOG);

  return composeShader(precision, uniforms, inputs, outputs, functions, main);
};

const FRAGMENT_SHADER = {
  COMBINER_OPAQUE: createFragmentShader(1, 'combine_opaque'),
  COMBINER_MOD: createFragmentShader(1, 'combine_mod'),
  DEFAULT: createFragmentShader(0, ''),
};

const getFragmentShader = (shader: MODEL_SHADER_FRAGMENT) => {
  if (shader === MODEL_SHADER_FRAGMENT.FRAGMENT_UNKNOWN) {
    return FRAGMENT_SHADER.DEFAULT;
  } else if (shader === MODEL_SHADER_FRAGMENT.FRAGMENT_OPAQUE) {
    return FRAGMENT_SHADER.COMBINER_OPAQUE;
  } else if (shader === MODEL_SHADER_FRAGMENT.FRAGMENT_MOD) {
    return FRAGMENT_SHADER.COMBINER_MOD;
  }

  return FRAGMENT_SHADER.DEFAULT;
};

export { getFragmentShader };
