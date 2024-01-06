import { WorkerResponse } from './types.js';
import { RESPONSE_STATUS } from './const.js';

class SceneWorkerController {
  #worker: Worker;

  #nextId = 0;
  #pending = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();

  constructor(createWorker: () => Worker, ...initializeArgs: any[]) {
    this.#worker = createWorker();

    this.#worker.addEventListener('message', (event: MessageEvent) => {
      this.#handleResponse(event.data);
    });

    this.request('initialize', ...initializeArgs).catch((error) => console.error(error));
  }

  request(func: string, ...args: any[]): Promise<any> {
    const id = this.#nextId++;

    const requestPromise = new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
    });

    this.#worker.postMessage({ id, func, args });

    return requestPromise;
  }

  #handleResponse(response: WorkerResponse) {
    const promise = this.#pending.get(response.id);

    if (response.status === RESPONSE_STATUS.STATUS_SUCCESS) {
      promise.resolve(response.value);
    } else {
      promise.reject(response.value);
    }

    this.#pending.delete(response.id);
  }
}

export default SceneWorkerController;
