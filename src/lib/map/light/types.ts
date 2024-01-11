import * as THREE from 'three';

type AreaLightParams = {
  id: number;
  intBands: any[][];
  floatBands: any[][];
};

type AreaLight = {
  id: number;
  mapId: number;
  position: THREE.Vector3;
  falloffStart: number;
  falloffEnd: number;
  params: AreaLightParams[];
};

export { AreaLight, AreaLightParams };
