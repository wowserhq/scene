import { M2_TEXTURE_COORD } from '@wowserhq/format';
import { MODEL_SHADER_VERTEX } from '../types.js';

const VERTEX_SHADER_PREAMBLE = `
precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform vec4 fogParams;

in vec3 position;
in vec3 normal;

out float vLight;
out float vFogFactor;
`;

const VERTEX_SHADER_FOG = `
float calculateFogFactor(in vec4 params, in float distance) {
  float start = params.x;
  float end = params.y;
  float density = params.z;
  float multiplier = params.w;

  float step = 1.0 / (end - start);
  float base = max((distance * -(multiplier * step)) + (end * step), 0.0);
  float factor = 1.0 - clamp(pow(base, density), 0.0, 1.0);

  return factor;
}
`;

const VERTEX_SHADER_MAIN_LIGHTING = `
// TODO - Replace with lighting manager controlled value
vec3 lightDirection = vec3(-1, -1, -1);
vLight = dot(normal, -normalize(lightDirection));
`;

const VERTEX_SHADER_MAIN_FOG = `
// Calculate camera distance for fog coloring in fragment shader
vec4 worldPosition = modelMatrix * vec4(position, 1.0);
float cameraDistance = distance(cameraPosition, worldPosition.xyz);
vFogFactor = calculateFogFactor(fogParams, cameraDistance);
`;

const VERTEX_SHADER_MAIN_POSITION = `
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
`;

const createVertexShader = (texCoord1?: M2_TEXTURE_COORD, texCoord2?: M2_TEXTURE_COORD) => {
  const shaderChunks = [];

  shaderChunks.push(VERTEX_SHADER_PREAMBLE);

  shaderChunks.push(VERTEX_SHADER_FOG);

  if (texCoord1 === M2_TEXTURE_COORD.COORD_T1 || texCoord2 === M2_TEXTURE_COORD.COORD_T1) {
    shaderChunks.push(`in vec2 texCoord1;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_T2 || texCoord2 === M2_TEXTURE_COORD.COORD_T2) {
    shaderChunks.push(`in vec2 texCoord2;`);
  }

  if (texCoord1 !== undefined) {
    shaderChunks.push(`out vec2 vTexCoord1;`);
  }

  if (texCoord2 !== undefined) {
    shaderChunks.push(`out vec2 vTexCoord2;`);
  }

  const mainChunks = [];

  if (texCoord1 === M2_TEXTURE_COORD.COORD_T1) {
    mainChunks.push(`vTexCoord1 = texCoord1;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_T2) {
    mainChunks.push(`vTexCoord1 = texCoord2;`);
  } else if (texCoord1 === M2_TEXTURE_COORD.COORD_ENV) {
    // TODO
    mainChunks.push(`vTexCoord1 = vec2(0.0, 0.0);`);
  }

  if (texCoord2 === M2_TEXTURE_COORD.COORD_T1) {
    mainChunks.push(`vTexCoord2 = texCoord1;`);
  } else if (texCoord2 === M2_TEXTURE_COORD.COORD_T2) {
    mainChunks.push(`vTexCoord2 = texCoord2;`);
  } else if (texCoord2 === M2_TEXTURE_COORD.COORD_ENV) {
    // TODO
    mainChunks.push(`vTexCoord2 = vec2(0.0, 0.0);`);
  }

  mainChunks.push(VERTEX_SHADER_MAIN_LIGHTING);
  mainChunks.push(VERTEX_SHADER_MAIN_FOG);
  mainChunks.push(VERTEX_SHADER_MAIN_POSITION);

  const main = [`void main() {`, mainChunks.map((chunk) => `  ${chunk}`).join('\n'), '}'].join(
    '\n',
  );

  shaderChunks.push(main);

  return shaderChunks.join('\n');
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
