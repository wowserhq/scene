import SceneWorkerController from '../../worker/SceneWorkerController.js';
import { ModelSpec } from './types.js';

const createWorker = () =>
  new Worker(new URL('./worker.js', import.meta.url), {
    name: 'model-loader',
    type: 'module',
  });

class ModelLoader extends SceneWorkerController {
  constructor(baseUrl: string, normalizePath: boolean = false) {
    super(createWorker, baseUrl, normalizePath);
  }

  loadSpec(path: string): Promise<ModelSpec> {
    return this.request('loadSpec', path);
  }
}

export default ModelLoader;
