import {
  M2_FRAGMENT_SHADER,
  M2_MATERIAL_BLEND,
  M2_TEXTURE_COMPONENT,
  M2_VERTEX_SHADER,
} from '@wowserhq/format';

type TextureSpec = {
  flags: number;
  component: M2_TEXTURE_COMPONENT;
  path: string;
};

type MaterialSpec = {
  flags: number;
  textures: TextureSpec[];
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

type ModelSpec = {
  name: string;
  geometry: GeometrySpec;
  materials: MaterialSpec[];
};

export { ModelSpec, MaterialSpec, TextureSpec };
