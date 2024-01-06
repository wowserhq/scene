import { M2_TEXTURE_COMBINER } from '@wowserhq/format';
import { MODEL_SHADER_FRAGMENT } from '../types.js';

const FRAGMENT_SHADER_PREAMBLE = `
precision highp float;

uniform sampler2D textures[2];
uniform vec3 fogColor;
uniform vec3 fogParams;
uniform float alphaRef;

in float vLight;
in float vCameraDistance;

out vec4 color;
`;

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

const FRAGMENT_SHADER_FOG = `
void applyFog(inout vec4 color, float distance) {
  float fogStart = fogParams.x;
  float fogEnd = fogParams.y;
  float fogModifier = fogParams.z;

  float fogFactor = (fogEnd - distance) / (fogEnd - fogStart);
  fogFactor = clamp(fogFactor * fogModifier, 0.0,  1.0);

  color = vec4(mix(color.rgb, fogColor.rgb, 1.0 - fogFactor), color.a);
}
`;

const FRAGMENT_SHADER_MAIN_ALPHATEST = `
// Alpha test
if (color.a < alphaRef) {
  discard;
}
`;

const FRAGMENT_SHADER_MAIN_LIGHTING = `
// Fixed lighting
vec3 lightDiffuse = normalize(vec3(0.25, 0.5, 1.0));
vec3 lightAmbient = normalize(vec3(0.5, 0.5, 0.5));
color.rgb *= lightDiffuse * vLight + lightAmbient;
`;

const FRAGMENT_SHADER_MAIN_FOG = `
// Apply fog
applyFog(color, vCameraDistance);
`;

const createFragmentShader = (textureCount: number, combineFunction: string) => {
  const shaderChunks = [];

  shaderChunks.push(FRAGMENT_SHADER_PREAMBLE);

  if (textureCount === 1) {
    shaderChunks.push(`in vec2 vTexCoord1;`);
  } else if (textureCount === 2) {
    shaderChunks.push(`in vec2 vTexCoord1;`);
    shaderChunks.push(`in vec2 vTexCoord2;`);
  }

  shaderChunks.push(FRAGMENT_SHADER_COMBINERS);

  shaderChunks.push(FRAGMENT_SHADER_FOG);

  const mainChunks = [];

  mainChunks.push(`color.rgba = vec4(1.0, 1.0, 1.0, 1.0);`);

  if (textureCount === 1) {
    mainChunks.push(`vec4 tex0 = texture(textures[0], vTexCoord1);`);
    mainChunks.push(`${combineFunction}(color, tex0);`);
  } else if (textureCount === 2) {
    mainChunks.push(`vec4 tex0 = texture(textures[0], vTexCoord1);`);
    mainChunks.push(`vec4 tex1 = texture(textures[1], vTexCoord2);`);
    mainChunks.push(`${combineFunction}(color, tex0, tex1);`);
  }

  mainChunks.push(FRAGMENT_SHADER_MAIN_ALPHATEST);

  mainChunks.push(FRAGMENT_SHADER_MAIN_LIGHTING);

  mainChunks.push(FRAGMENT_SHADER_MAIN_FOG);

  const main = [`void main() {`, mainChunks.map((chunk) => `  ${chunk}`).join('\n'), '}'].join(
    '\n',
  );

  shaderChunks.push(main);

  return shaderChunks.join('\n');
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
