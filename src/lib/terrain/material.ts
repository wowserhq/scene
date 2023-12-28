import * as THREE from 'three';
import { MAP_LAYER_SPLAT_X, MAP_LAYER_SPLAT_Y, MapLayer } from '@wowserhq/format';
import terrainWorker from './worker.js';

const SPLAT_TEXTURE_PLACEHOLDER = new THREE.Texture();

const createSplatTexture = async (layers: MapLayer[]) => {
  // Handle no splat

  if (layers.length <= 1) {
    // Return placeholder texture to keep uniforms consistent
    return SPLAT_TEXTURE_PLACEHOLDER;
  }

  // Handle single splat (2 layers)

  if (layers.length === 2) {
    const texture = new THREE.DataTexture(
      layers[1].splat,
      MAP_LAYER_SPLAT_X,
      MAP_LAYER_SPLAT_Y,
      THREE.RedFormat,
    );
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    texture.needsUpdate = true;

    return texture;
  }

  // Handle multiple splats (3+ layers)

  const layerSplats = layers.slice(1).map((layer) => layer.splat);
  const data = await terrainWorker.call(
    'mergeLayerSplats',
    layerSplats,
    MAP_LAYER_SPLAT_X,
    MAP_LAYER_SPLAT_Y,
  );

  const texture = new THREE.DataTexture(
    data,
    MAP_LAYER_SPLAT_X,
    MAP_LAYER_SPLAT_Y,
    THREE.RGBAFormat,
  );
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  return texture;
};

export { createSplatTexture };
