type MapSpec = {
  availableAreas: Uint8Array;
};

type MapDoodadDefSpec = {
  id: number;
  name: string;
  position: Float32Array;
  rotation: Float32Array;
  scale: number;
};

type TerrainLayerSpec = {
  texturePath: string;
  effectId: number;
};

type TerrainSplatSpec = {
  data: Uint8Array;
  width: number;
  height: number;
  channels: number;
};

type TerrainMaterialSpec = {
  splat: TerrainSplatSpec;
  layers: TerrainLayerSpec[];
};

type TerrainGeometrySpec = {
  vertexBuffer: ArrayBuffer;
  indexBuffer: ArrayBuffer;
};

type TerrainSpec = {
  position: Float32Array;
  geometry: TerrainGeometrySpec;
  material: TerrainMaterialSpec;
};

type MapAreaSpec = {
  terrain: TerrainSpec[];
  doodadDefs: MapDoodadDefSpec[];
};

export { MapSpec, MapAreaSpec, TerrainSpec };
