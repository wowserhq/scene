import context from './worker/context.js';
import constants from './worker/constants.js';
import SceneWorker from '../SceneWorker.js';

const terrainWorker = new SceneWorker('terrain-worker', context, constants);

export default terrainWorker;
