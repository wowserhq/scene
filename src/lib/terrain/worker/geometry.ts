import {
  MAP_CHUNK_WIDTH,
  MAP_CHUNK_HEIGHT,
  MAP_CHUNK_FACE_COUNT_X,
  MAP_CHUNK_FACE_COUNT_Y,
  MAP_CHUNK_VERTEX_COUNT,
  MAP_CHUNK_VERTEX_STEP_X,
  MAP_CHUNK_VERTEX_STEP_Y,
} from '@wowserhq/format';

const isTerrainHole = (holes: number, x: number, y: number) => {
  const column = (y / 2) | 0;
  const row = (x / 2) | 0;
  const hole = 1 << (column * 4 + row);

  return (hole & holes) !== 0;
};

const createTerrainVertexBuffer = (vertexHeights: Float32Array, vertexNormals: Int8Array) => {
  // Copy the default vertex buffer (contains x and y coordinates)
  const data = self['DEFAULT_TERRAIN_VERTEX_BUFFER'].slice(0);
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

const createTerrainIndexBuffer = (holes: number, faceCountX: number, faceCountY: number) => {
  const data = new ArrayBuffer(faceCountX * faceCountY * 3 * 4 * 2);
  const view = new DataView(data);

  let i = 0;

  for (let x = 0; x < faceCountX; x++) {
    for (let y = 0; y < faceCountY; y++) {
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

export {
  MAP_CHUNK_WIDTH,
  MAP_CHUNK_HEIGHT,
  MAP_CHUNK_FACE_COUNT_X,
  MAP_CHUNK_FACE_COUNT_Y,
  MAP_CHUNK_VERTEX_COUNT,
  MAP_CHUNK_VERTEX_STEP_X,
  MAP_CHUNK_VERTEX_STEP_Y,
  isTerrainHole,
  createTerrainVertexBuffer,
  createTerrainIndexBuffer,
};
