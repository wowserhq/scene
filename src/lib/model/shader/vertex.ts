import { M2_TEXTURE_COORD } from '@wowserhq/format';
import { MODEL_SHADER_VERTEX } from '../types.js';
import {
  FUNCTION_CALCULATE_FOG_FACTOR,
  UNIFORM_FOG_PARAMS,
  VARIABLE_FOG_FACTOR,
} from '../../shader/fog.js';
import { composeShader } from '../../shader/util.js';

const VERTEX_SHADER_PRECISION = 'highp float';

const VERTEX_SHADER_UNIFORMS = [
  { name: 'modelMatrix', type: 'mat4' },
  { name: 'modelViewMatrix', type: 'mat4' },
  { name: 'normalMatrix', type: 'mat3' },
  { name: 'viewMatrix', type: 'mat4' },
  { name: 'projectionMatrix', type: 'mat4' },
  { name: 'cameraPosition', type: 'vec3' },
];

const VERTEX_SHADER_INPUTS = [
  { name: 'position', type: 'vec3' },
  { name: 'normal', type: 'vec3' },
];

const VERTEX_SHADER_OUTPUTS = [{ name: 'vLight', type: 'float' }];

const VERTEX_SHADER_FUNCTIONS = [];

const VERTEX_SHADER_MAIN_LIGHTING = `
// TODO - Replace with lighting manager controlled value
vec3 lightDirection = vec3(-1, -1, -1);
vec3 viewLightDirection = (viewMatrix * vec4(lightDirection, 0.0)).xyz;
vec3 viewNormal = normalize(normalMatrix * normal);
vLight = clamp(dot(-viewLightDirection, viewNormal), 0.0, 1.0);
`;

const VERTEX_SHADER_MAIN_FOG = `
// Calculate camera distance for fog coloring in fragment shader
vec4 worldPosition = modelMatrix * vec4(position, 1.0);
float cameraDistance = distance(cameraPosition, worldPosition.xyz);
${VARIABLE_FOG_FACTOR.name} = calculateFogFactor(${UNIFORM_FOG_PARAMS.name}, cameraDistance);
`;

const VERTEX_SHADER_MAIN_POSITION = `
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
`;

const createVertexShader = (texCoord1?: M2_TEXTURE_COORD, texCoord2?: M2_TEXTURE_COORD) => {
  const precision = VERTEX_SHADER_PRECISION;

  // Uniforms

  const uniforms = VERTEX_SHADER_UNIFORMS.slice(0);

  uniforms.push(UNIFORM_FOG_PARAMS);

  // Inputs

  const inputs = VERTEX_SHADER_INPUTS.slice(0);

  if (texCoord1 === M2_TEXTURE_COORD.COORD_T1 || texCoord2 === M2_TEXTURE_COORD.COORD_T1) {
    inputs.push({ name: 'texCoord1', type: 'vec2' });
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_T2 || texCoord2 === M2_TEXTURE_COORD.COORD_T2) {
    inputs.push({ name: 'texCoord2', type: 'vec2' });
  }

  // Outputs

  const outputs = VERTEX_SHADER_OUTPUTS.slice(0);

  if (texCoord1 !== undefined) {
    outputs.push({ name: 'vTexCoord1', type: 'vec2' });
  }

  if (texCoord2 !== undefined) {
    outputs.push({ name: 'vTexCoord2', type: 'vec2' });
  }

  outputs.push(VARIABLE_FOG_FACTOR);

  // Functions

  const functions = VERTEX_SHADER_FUNCTIONS.slice(0);

  functions.push(FUNCTION_CALCULATE_FOG_FACTOR);

  // Main

  const main = [];

  if (texCoord1 === M2_TEXTURE_COORD.COORD_T1) {
    main.push(`vTexCoord1 = texCoord1;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_T2) {
    main.push(`vTexCoord1 = texCoord2;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_ENV) {
    // TODO
    main.push(`vTexCoord1 = vec2(0.0, 0.0);`);
  }

  if (texCoord2 === M2_TEXTURE_COORD.COORD_T1) {
    main.push(`vTexCoord2 = texCoord1;`);
  } else if (texCoord2 === M2_TEXTURE_COORD.COORD_T2) {
    main.push(`vTexCoord2 = texCoord2;`);
  } else if (texCoord2 === M2_TEXTURE_COORD.COORD_ENV) {
    // TODO
    main.push(`vTexCoord2 = vec2(0.0, 0.0);`);
  }

  main.push(VERTEX_SHADER_MAIN_LIGHTING);
  main.push(VERTEX_SHADER_MAIN_FOG);
  main.push(VERTEX_SHADER_MAIN_POSITION);

  return composeShader(precision, uniforms, inputs, outputs, functions, main);
};

const VERTEX_SHADER = {
  T1: createVertexShader(M2_TEXTURE_COORD.COORD_T1),
  T2: createVertexShader(M2_TEXTURE_COORD.COORD_T2),
  ENV: createVertexShader(M2_TEXTURE_COORD.COORD_ENV),
  T1_T2: createVertexShader(M2_TEXTURE_COORD.COORD_T1, M2_TEXTURE_COORD.COORD_T2),
  T1_ENV: createVertexShader(M2_TEXTURE_COORD.COORD_T1, M2_TEXTURE_COORD.COORD_ENV),
  ENV_T2: createVertexShader(M2_TEXTURE_COORD.COORD_ENV, M2_TEXTURE_COORD.COORD_T2),
  ENV_ENV: createVertexShader(M2_TEXTURE_COORD.COORD_ENV, M2_TEXTURE_COORD.COORD_ENV),
  DEFAULT: createVertexShader(),
};

const getVertexShader = (shader: MODEL_SHADER_VERTEX) => {
  if (shader === MODEL_SHADER_VERTEX.VERTEX_UNKNOWN) {
    return VERTEX_SHADER.DEFAULT;
  } else if (shader === MODEL_SHADER_VERTEX.VERTEX_T1) {
    return VERTEX_SHADER.T1;
  } else if (shader === MODEL_SHADER_VERTEX.VERTEX_T2) {
    return VERTEX_SHADER.T2;
  } else if (shader === MODEL_SHADER_VERTEX.VERTEX_ENV) {
    return VERTEX_SHADER.ENV;
  }

  return VERTEX_SHADER.DEFAULT;
};

export { getVertexShader };
