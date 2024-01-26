import {
  M2_FRAGMENT_SHADER,
  M2_MATERIAL_BLEND,
  M2_TEXTURE_COMPONENT,
  M2_VERTEX_SHADER,
  M2Color,
  M2TextureTransform,
  M2TextureWeight,
} from '@wowserhq/format';

type TextureSpec = {
  flags: number;
  component: M2_TEXTURE_COMPONENT;
  path: string;
};

type MaterialSpec = {
  flags: number;
  textures: TextureSpec[];
  textureWeightIndex: number;
  textureTransformIndices: number[];
  materialColorIndex: number;
  vertexShader: M2_VERTEX_SHADER;
  fragmentShader: M2_FRAGMENT_SHADER;
  blend: M2_MATERIAL_BLEND;
};

type GroupSpec = {
  start: number;
  count: number;
  materialIndex: number;
};

type GeometrySpec = {
  bounds: { extent: Float32Array; center: Float32Array; radius: number };
  vertexBuffer: ArrayBuffer;
  indexBuffer: ArrayBuffer;
  groups: GroupSpec[];
};

type SequenceSpec = {
  id: number;
  variationIndex: number;
  duration: number;
  moveSpeed: number;
  flags: number;
  frequency: number;
  blendTime: number;
  variationNext: number;
  aliasNext: number;
};

type ModelSpec = {
  name: string;
  geometry: GeometrySpec;
  materials: MaterialSpec[];
  sequences: SequenceSpec[];
  loops: Uint32Array;
  textureWeights: M2TextureWeight[];
  textureTransforms: M2TextureTransform[];
  materialColors: M2Color[];
};

export { ModelSpec, MaterialSpec, TextureSpec, SequenceSpec };
