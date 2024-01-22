import { M2_FRAGMENT_SHADER } from '@wowserhq/format';
import { VARIABLE_FOG_FACTOR, FUNCTION_APPLY_FOG, UNIFORM_FOG_COLOR } from '../../shader/fog.js';
import { composeShader } from '../../shader/util.js';

const FRAGMENT_SHADER_PRECISION = 'highp float';

const FRAGMENT_SHADER_UNIFORMS = [
  { name: 'textures[2]', type: 'sampler2D' },
  { name: 'materialParams', type: 'vec4' },
  { name: 'sunDiffuseColor', type: 'vec3' },
  { name: 'sunAmbientColor', type: 'vec3' },
  { name: 'diffuseColor', type: 'vec3' },
  { name: 'emissiveColor', type: 'vec3' },
];

const FRAGMENT_SHADER_INPUTS = [{ name: 'vLight', type: 'float' }];

const FRAGMENT_SHADER_OUTPUTS = [{ name: 'color', type: 'vec4' }];

const FRAGMENT_SHADER_FUNCTIONS = [];

const FRAGMENT_SHADER_COMBINERS = `
void combineOpaque(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb * tex0.rgb;
}

void combineAdd(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb + tex0.rgb;
  color.a = color.a + tex0.a;
}

void combineDecal(inout vec4 color, in vec4 tex0) {
  color.rgb = mix(color.rgb, tex0.rgb, color.a);
}

void combineFade(inout vec4 color, in vec4 tex0) {
  color.rgb = mix(tex0.rgb, color.rgb, color.a);
}

void combineMod(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb * tex0.rgb;
  color.a = color.a * tex0.a;
}

void combineMod2x(inout vec4 color, in vec4 tex0) {
  color.rgb = color.rgb * tex0.rgb * 2.0;
  color.a = color.a * tex0.a * 2.0;
}

void combineOpaqueAdd(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + tex1.rgb;
  color.a = color.a + tex1.a;
}

void combineOpaqueAddAlpha(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + (tex1.rgb * tex1.a);
}

void combineOpaqueAddAlphaAlpha(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + (tex1.rgb * tex1.a * tex0.a);
}

void combineOpaqueAddNa(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) + tex1.rgb;
}

void combineOpaqueMod(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) * tex1.rgb;
  color.a = color.a * tex1.a;
}

void combineOpaqueMod2x(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) * tex1.rgb * 2.0;
  color.a = color.a * tex1.a * 2.0;
}

void combineOpaqueMod2xNa(inout vec4 color, in vec4 tex0, in vec4 tex1) {
  color.rgb = (color.rgb * tex0.rgb) * tex1.rgb * 2.0;
}
`;

const FRAGMENT_SHADER_MAIN_ALPHATEST = `
// Alpha test
if (color.a < materialParams.y) {
  discard;
}
`;

const FRAGMENT_SHADER_MAIN_LIGHTING = `
vec3 sunColor = clamp((sunDiffuseColor * vLight) + sunAmbientColor, 0.0, 1.0);
color.rgb = mix(color.rgb, color.rgb * sunColor, materialParams.z);
`;

const FRAGMENT_SHADER_MAIN_COLOR = `
color.rgb = clamp((color.rgb * diffuseColor.rgb) + emissiveColor.rgb, 0.0, 1.0);
`;

const FRAGMENT_SHADER_MAIN_FOG = `
// Apply fog
applyFog(color, ${UNIFORM_FOG_COLOR.name}, ${VARIABLE_FOG_FACTOR.name} * materialParams.w);
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

  main.push(FRAGMENT_SHADER_MAIN_LIGHTING);

  main.push(FRAGMENT_SHADER_MAIN_COLOR);

  if (textureCount === 1) {
    main.push(`vec4 tex0 = texture(textures[0], vTexCoord1);`);
    main.push(`${combineFunction}(color, tex0);`);
  } else if (textureCount === 2) {
    main.push(`vec4 tex0 = texture(textures[0], vTexCoord1);`);
    main.push(`vec4 tex1 = texture(textures[1], vTexCoord2);`);
    main.push(`${combineFunction}(color, tex0, tex1);`);
  }

  main.push(FRAGMENT_SHADER_MAIN_ALPHATEST);

  main.push(FRAGMENT_SHADER_MAIN_FOG);

  return composeShader(precision, uniforms, inputs, outputs, functions, main);
};

const FRAGMENT_SHADER = {
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE]: createFragmentShader(1, 'combineOpaque'),
  [M2_FRAGMENT_SHADER.FRAGMENT_MOD]: createFragmentShader(1, 'combineMod'),
  [M2_FRAGMENT_SHADER.FRAGMENT_DECAL]: createFragmentShader(1, 'combineDecal'),
  [M2_FRAGMENT_SHADER.FRAGMENT_ADD]: createFragmentShader(1, 'combineAdd'),
  [M2_FRAGMENT_SHADER.FRAGMENT_MOD2X]: createFragmentShader(1, 'combineMod2x'),
  [M2_FRAGMENT_SHADER.FRAGMENT_FADE]: createFragmentShader(1, 'combineFade'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_OPAQUE]: createFragmentShader(2, 'combineOpaqueOpaque'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_ADD]: createFragmentShader(2, 'combineOpaqueAdd'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_ADDALPHA]: createFragmentShader(2, 'combineOpaqueAddAlpha'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_MOD2X]: createFragmentShader(2, 'combineOpaqueMod2x'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_MOD2XNA]: createFragmentShader(2, 'combineOpaqueMod2xNa'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_ADDNA]: createFragmentShader(2, 'combineOpaqueAddNa'),
  [M2_FRAGMENT_SHADER.FRAGMENT_OPAQUE_MOD]: createFragmentShader(2, 'combineOpaqueMod'),
  [M2_FRAGMENT_SHADER.FRAGMENT_UNKNOWN]: createFragmentShader(0, ''),
};

const getFragmentShader = (shader: M2_FRAGMENT_SHADER) =>
  FRAGMENT_SHADER[shader] ?? FRAGMENT_SHADER[M2_FRAGMENT_SHADER.FRAGMENT_UNKNOWN];

export { getFragmentShader };
