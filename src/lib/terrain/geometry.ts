import { MapChunk, MAP_CHUNK_FACE_COUNT_X, MAP_CHUNK_FACE_COUNT_Y } from '@wowserhq/format';
import terrainWorker from './worker.js';

const createTerrainVertexBuffer = (chunk: MapChunk) =>
  terrainWorker.call('createTerrainVertexBuffer', chunk.vertexHeights, chunk.vertexNormals);

const createTerrainIndexBuffer = (chunk: MapChunk) =>
  terrainWorker.call(
    'createTerrainIndexBuffer',
    chunk.holes,
    MAP_CHUNK_FACE_COUNT_X,
    MAP_CHUNK_FACE_COUNT_Y,
  );

export { createTerrainVertexBuffer, createTerrainIndexBuffer };
