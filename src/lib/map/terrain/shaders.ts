const vertexShader = `
precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

in vec3 position;
in vec3 normal;

out vec2 layerCoord;
out vec2 splatCoord;
out float light;
out float cameraDistance;

void main() {
  // Terrain tileset textures repeat 8 times over the terrain chunk
  vec4 layerScale = vec4(-0.24, -0.24, 0.0, 0.0);
  layerCoord.xy = position.xy * layerScale.xy;

  // Splat textures do not repeat over the terrain chunk
  vec4 splatScale = vec4(-0.03, -0.03, 0.0, 0.0);
  splatCoord.yx = position.xy * splatScale.xy;

  // TODO - Replace with lighting manager controlled value
  vec3 lightDirection = vec3(-1, -1, -1);
  light = dot(normal, -normalize(lightDirection));

  // Calculate camera distance for fog coloring in fragment shader
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  cameraDistance = distance(cameraPosition, worldPosition.xyz);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform int layerCount;
uniform sampler2D layers[4];
uniform sampler2D splat;
uniform vec3 fogColor;
uniform vec3 fogParams;

in vec2 layerCoord;
in vec2 splatCoord;
in float light;
in float cameraDistance;

out vec4 color;

vec4 applyFog(vec4 color) {
  float fogStart = fogParams.x;
  float fogEnd = fogParams.y;
  float fogModifier = fogParams.z;

  float fogFactor = (fogEnd - cameraDistance) / (fogEnd - fogStart);
  fogFactor = clamp(fogFactor * fogModifier, 0.0,  1.0);

  vec4 mixed = vec4(mix(color.rgb, fogColor.rgb, 1.0 - fogFactor), color.a);

  return mixed;
}

vec4 blendLayer(vec4 color, vec4 layer, vec4 blend) {
  return (layer * blend) + ((1.0 - blend) * color);
}

void main() {
  vec4 layer;
  vec4 blend;

  // 1st layer
  color = texture(layers[0], layerCoord);
  blend = texture(splat, splatCoord);

  // 2nd layer
  if (layerCount > 1) {
    layer = texture(layers[1], layerCoord);
    color = blendLayer(color, layer, blend.rrrr);
  }

  if (layerCount > 2) {
    layer = texture(layers[2], layerCoord);
    color = blendLayer(color, layer, blend.gggg);
  }

  // 3rd layer
  if (layerCount > 3) {
    layer = texture(layers[3], layerCoord);
    color = blendLayer(color, layer, blend.bbbb);
  }

  // Fixed lighting
  vec3 lightDiffuse = normalize(vec3(0.25, 0.5, 1.0));
  vec3 lightAmbient = normalize(vec3(0.5, 0.5, 0.5));
  color.rgb *= lightDiffuse * light + lightAmbient;

  color.rgb = applyFog(color).rgb;

  // Terrain is always opaque
  color.a = 1.0;
}
`;

export { vertexShader, fragmentShader };
