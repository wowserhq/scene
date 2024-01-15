import { M2_MATERIAL_BLEND, M2_TEXTURE_COMPONENT } from '@wowserhq/format';
import { MODEL_SHADER_FRAGMENT, MODEL_SHADER_VERTEX } from '../types.js';

type TextureSpec = {
  flags: number;
  component: M2_TEXTURE_COMPONENT;
  path: string;
};

type MaterialSpec = {
  flags: number;
  textures: TextureSpec[];
  vertexShader: MODEL_SHADER_VERTEX;
  fragmentShader: MODEL_SHADER_FRAGMENT;
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
