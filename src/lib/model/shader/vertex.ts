import { M2_TEXTURE_COORD } from '@wowserhq/format';

const VERTEX_SHADER_PREAMBLE = `
precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

in vec3 position;
in vec3 normal;

out float vLight;
out float vCameraDistance;
`;

const VERTEX_SHADER_MAIN_LIGHTING = `
// TODO - Replace with lighting manager controlled value
vec3 lightDirection = vec3(-1, -1, -1);
vLight = dot(normal, -normalize(lightDirection));
`;

const VERTEX_SHADER_MAIN_DISTANCE = `
// Calculate camera distance for fog coloring in fragment shader
vec4 worldPosition = modelMatrix * vec4(position, 1.0);
vCameraDistance = distance(cameraPosition, worldPosition.xyz);
`;

const VERTEX_SHADER_MAIN_POSITION = `
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
`;

const createVertexShader = (texCoord1?: M2_TEXTURE_COORD, texCoord2?: M2_TEXTURE_COORD) => {
  const shaderChunks = [];

  shaderChunks.push(VERTEX_SHADER_PREAMBLE);

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
  mainChunks.push(VERTEX_SHADER_MAIN_DISTANCE);
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

const getVertexShader = (coords: M2_TEXTURE_COORD[]) => {
  if (coords.length === 0) {
    return VERTEX_SHADER.DEFAULT;
  }

  if (coords.length === 1) {
    switch (coords[0]) {
      case M2_TEXTURE_COORD.COORD_T1:
        return VERTEX_SHADER.T1;
      case M2_TEXTURE_COORD.COORD_T2:
        return VERTEX_SHADER.T2;
      case M2_TEXTURE_COORD.COORD_ENV:
        return VERTEX_SHADER.ENV;
    }
  }

  return VERTEX_SHADER.DEFAULT;
};

export { getVertexShader };
