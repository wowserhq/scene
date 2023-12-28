import context from './worker/context.js';
import SceneWorker from '../SceneWorker.js';

const terrainWorker = new SceneWorker('terrain-worker', context);

export default terrainWorker;
