import { M2_TEXTURE_COORD, M2_VERTEX_SHADER } from '@wowserhq/format';
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
  { name: 'projectionMatrix', type: 'mat4' },
  { name: 'cameraPosition', type: 'vec3' },
  { name: 'sunDir', type: 'vec3' },
  { name: 'textureTransforms[2]', type: 'mat4' },
];

const VERTEX_SHADER_INPUTS = [
  { name: 'position', type: 'vec3' },
  { name: 'normal', type: 'vec3' },
];

const VERTEX_SHADER_OUTPUTS = [{ name: 'vLight', type: 'float' }];

const VERTEX_SHADER_SPHERE_MAP = `
vec2 sphereMap(vec3 position, vec3 normal) {
  vec3 viewPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));
  vec3 viewNormal = normalize(normalMatrix * normal);

  vec3 temp = (-viewPosition - (viewNormal * (2.0 * dot(-viewPosition, viewNormal))));
  temp = vec3(temp.x, temp.y, temp.z + 1.0);

  return (normalize(temp).xy * 0.5) + vec2(0.5);
}
`;

const VERTEX_SHADER_FUNCTIONS = [VERTEX_SHADER_SPHERE_MAP];

const VERTEX_SHADER_MAIN_LIGHTING = `
vec3 viewNormal = normalize(normalMatrix * normal);
vLight = clamp(dot(viewNormal, -sunDir), 0.0, 1.0);
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
  }

  if (texCoord1 === M2_TEXTURE_COORD.COORD_T2 || texCoord2 === M2_TEXTURE_COORD.COORD_T2) {
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
    main.push(`vTexCoord1 = (textureTransforms[0] * vec4(texCoord1, 0.0, 1.0)).xy;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_T2) {
    main.push(`vTexCoord1 = (textureTransforms[0] * vec4(texCoord2, 0.0, 1.0)).xy;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_ENV) {
    main.push(`vTexCoord1 = sphereMap(position, normal);`);
  }

  if (texCoord2 === M2_TEXTURE_COORD.COORD_T1) {
    main.push(`vTexCoord2 = (textureTransforms[1] * vec4(texCoord1, 0.0, 1.0)).xy;`);
  } else if (texCoord2 === M2_TEXTURE_COORD.COORD_T2) {
    main.push(`vTexCoord2 = (textureTransforms[1] * vec4(texCoord2, 0.0, 1.0)).xy;`);
  } else if (texCoord2 === M2_TEXTURE_COORD.COORD_ENV) {
    main.push(`vTexCoord2 = sphereMap(position, normal);`);
  }

  main.push(VERTEX_SHADER_MAIN_LIGHTING);
  main.push(VERTEX_SHADER_MAIN_FOG);
  main.push(VERTEX_SHADER_MAIN_POSITION);

  return composeShader(precision, uniforms, inputs, outputs, functions, main);
};

// prettier-ignore
const VERTEX_SHADER = {
  [M2_VERTEX_SHADER.VERTEX_T1]: createVertexShader(M2_TEXTURE_COORD.COORD_T1),
  [M2_VERTEX_SHADER.VERTEX_T2]: createVertexShader(M2_TEXTURE_COORD.COORD_T2),
  [M2_VERTEX_SHADER.VERTEX_ENV]: createVertexShader(M2_TEXTURE_COORD.COORD_ENV),
  [M2_VERTEX_SHADER.VERTEX_T1_T2]: createVertexShader(M2_TEXTURE_COORD.COORD_T1, M2_TEXTURE_COORD.COORD_T2),
  [M2_VERTEX_SHADER.VERTEX_T1_ENV]: createVertexShader(M2_TEXTURE_COORD.COORD_T1, M2_TEXTURE_COORD.COORD_ENV),
  [M2_VERTEX_SHADER.VERTEX_ENV_T2]: createVertexShader(M2_TEXTURE_COORD.COORD_ENV, M2_TEXTURE_COORD.COORD_T2),
  [M2_VERTEX_SHADER.VERTEX_ENV_ENV]: createVertexShader(M2_TEXTURE_COORD.COORD_ENV, M2_TEXTURE_COORD.COORD_ENV),
  [M2_VERTEX_SHADER.VERTEX_UNKNOWN]: createVertexShader(),
};

const getVertexShader = (shader: M2_VERTEX_SHADER) => {
  if (VERTEX_SHADER[shader]) {
    return VERTEX_SHADER[shader];
  }

  console.warn(`model: unimplemented vertex shader ${M2_VERTEX_SHADER[shader]}`);

  return VERTEX_SHADER[M2_VERTEX_SHADER.VERTEX_UNKNOWN];
};

export { getVertexShader };
