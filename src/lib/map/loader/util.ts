import {
  MAP_CHUNK_FACE_COUNT_X,
  MAP_CHUNK_FACE_COUNT_Y,
  MAP_CHUNK_HEIGHT,
  MAP_CHUNK_VERTEX_COUNT,
  MAP_CHUNK_VERTEX_STEP_X,
  MAP_CHUNK_VERTEX_STEP_Y,
  MAP_CHUNK_WIDTH,
} from '@wowserhq/format';
import { DEFAULT_TERRAIN_VERTEX_BUFFER } from './const.js';

const isTerrainHole = (holes: number, x: number, y: number) => {
  const column = (y / 2) | 0;
  const row = (x / 2) | 0;
  const hole = 1 << (column * 4 + row);

  return (hole & holes) !== 0;
};

const createDefaultTerrainVertexBuffer = () => {
  // Vertex coordinates for x-axis (forward axis)
  const vxe = new Float32Array(MAP_CHUNK_FACE_COUNT_X + 1);
  const vxo = new Float32Array(MAP_CHUNK_FACE_COUNT_X);
  for (let i = 0; i < MAP_CHUNK_FACE_COUNT_X; i++) {
    const vx = -(i * MAP_CHUNK_VERTEX_STEP_X);
    vxe[i] = vx;
    vxo[i] = vx - MAP_CHUNK_VERTEX_STEP_X / 2.0;
  }
  vxe[MAP_CHUNK_FACE_COUNT_X] = -MAP_CHUNK_HEIGHT;

  // Vertex coordinates for y-axis (right axis)
  const vye = new Float32Array(MAP_CHUNK_FACE_COUNT_Y + 1);
  const vyo = new Float32Array(MAP_CHUNK_FACE_COUNT_Y);
  for (let i = 0; i < MAP_CHUNK_FACE_COUNT_Y; i++) {
    const vy = -(i * MAP_CHUNK_VERTEX_STEP_Y);
    vye[i] = vy;
    vyo[i] = vy - MAP_CHUNK_VERTEX_STEP_Y / 2.0;
  }
  vye[MAP_CHUNK_FACE_COUNT_Y] = -MAP_CHUNK_WIDTH;

  const vertexBuffer = new ArrayBuffer(MAP_CHUNK_VERTEX_COUNT * 16);
  const vertexBufferView = new DataView(vertexBuffer);

  let i = 0;

  for (let x = 0; x < MAP_CHUNK_FACE_COUNT_X + 1; x++) {
    // Evens
    for (let y = 0; y < MAP_CHUNK_FACE_COUNT_Y + 1; y++) {
      vertexBufferView.setFloat32(i * 16 + 0, vxe[x], true);
      vertexBufferView.setFloat32(i * 16 + 4, vye[y], true);

      i++;
    }

    // Odds
    if (x < MAP_CHUNK_FACE_COUNT_X) {
      for (let y = 0; y < MAP_CHUNK_FACE_COUNT_Y; y++) {
        vertexBufferView.setFloat32(i * 16 + 0, vxo[x], true);
        vertexBufferView.setFloat32(i * 16 + 4, vyo[y], true);

        i++;
      }
    }
  }

  return vertexBuffer;
};

const createTerrainVertexBuffer = (vertexHeights: Float32Array, vertexNormals: Int8Array) => {
  // Copy the default vertex buffer (contains x and y coordinates)
  const data = DEFAULT_TERRAIN_VERTEX_BUFFER.slice(0);
  const view = new DataView(data);

  for (let i = 0; i < vertexHeights.length; i++) {
    const vertexOfs = i * 16;

    view.setFloat32(vertexOfs + 8, vertexHeights[i], true);

    const normalOfs = i * 3;
    view.setInt8(vertexOfs + 12, vertexNormals[normalOfs + 0]);
    view.setInt8(vertexOfs + 13, vertexNormals[normalOfs + 1]);
    view.setInt8(vertexOfs + 14, vertexNormals[normalOfs + 2]);
  }

  return data;
};

const createTerrainIndexBuffer = (holes: number) => {
  const data = new ArrayBuffer(MAP_CHUNK_FACE_COUNT_X * MAP_CHUNK_FACE_COUNT_Y * 3 * 4 * 2);
  const view = new DataView(data);

  let i = 0;

  for (let x = 0; x < MAP_CHUNK_FACE_COUNT_X; x++) {
    for (let y = 0; y < MAP_CHUNK_FACE_COUNT_Y; y++) {
      if (isTerrainHole(holes, x, y)) {
        continue;
      }

      const f = x * 17 + y + 9;

      view.setUint16(i * 24 + 0, f, true);
      view.setUint16(i * 24 + 2, f - 9, true);
      view.setUint16(i * 24 + 4, f + 8, true);

      view.setUint16(i * 24 + 6, f, true);
      view.setUint16(i * 24 + 8, f - 8, true);
      view.setUint16(i * 24 + 10, f - 9, true);

      view.setUint16(i * 24 + 12, f, true);
      view.setUint16(i * 24 + 14, f + 9, true);
      view.setUint16(i * 24 + 16, f - 8, true);

      view.setUint16(i * 24 + 18, f, true);
      view.setUint16(i * 24 + 20, f + 8, true);
      view.setUint16(i * 24 + 22, f + 9, true);

      i++;
    }
  }

  return data;
};

const mergeTerrainLayerSplats = (layerSplats: Uint8Array[], width: number, height: number) => {
  const data = new Uint8Array(width * height * 4);

  // Treat each layer splat as a separate color channel
  for (let l = 0; l < layerSplats.length; l++) {
    const layerSplat = layerSplats[l];

    for (let i = 0; i < width * height; i++) {
      data[i * 4 + l] = layerSplat[i];
    }
  }

  return data;
};

export {
  createDefaultTerrainVertexBuffer,
  createTerrainIndexBuffer,
  createTerrainVertexBuffer,
  mergeTerrainLayerSplats,
};
