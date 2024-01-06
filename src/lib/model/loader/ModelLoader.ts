import SceneWorkerController from '../../worker/SceneWorkerController.js';
import { ModelSpec } from './types.js';
import { AssetHost } from '../../asset.js';

const createWorker = () =>
  new Worker(new URL('./worker.js', import.meta.url), {
    name: 'model-loader',
    type: 'module',
  });

type ModelLoaderOptions = {
  host: AssetHost;
};

class ModelLoader extends SceneWorkerController {
  constructor(options: ModelLoaderOptions) {
    super(createWorker, { host: options.host });
  }

  loadSpec(path: string): Promise<ModelSpec> {
    return this.request('loadSpec', path);
  }
}

export default ModelLoader;
