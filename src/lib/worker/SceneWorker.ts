import { RESPONSE_STATUS } from './const.js';
import { WorkerRequest, WorkerResponse } from './types.js';

class SceneWorker {
  #initialized = false;
  #initializing: Promise<void>;
  #initializingResolve: (value?: any) => void;
  #initializingReject: (reason?: any) => void;

  constructor() {
    self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
      const request = event.data;

      this.#handleRequest(request).catch((error: Error) => this.#handleError(request, error));
    });

    this.#initializing = new Promise((resolve, reject) => {
      this.#initializingResolve = resolve;
      this.#initializingReject = reject;
    });
  }

  initialize(...args: any[]) {}

  async #handleRequest(request: WorkerRequest) {
    // Hold other requests back until initialize is handled
    if (!this.#initialized && request.func !== 'initialize') {
      await this.#initializing;
    }

    const func = this[request.func];
    if (!func) {
      throw new Error(`Invalid function name: ${request.func}`);
    }

    const args = request.args ?? [];

    const out = await this[request.func](...args);

    if (Array.isArray(out)) {
      const [value, transfer] = out;
      this.#handleSuccess(request, value, transfer);
    } else {
      const value = out;
      this.#handleSuccess(request, value);
    }
  }

  #handleError(request: WorkerRequest, error: Error) {
    if (!this.#initialized && request.func === 'initialize') {
      this.#initializingReject(error);
    }

    const response: WorkerResponse = {
      id: request.id,
      status: RESPONSE_STATUS.STATUS_ERROR,
      value: error,
    };

    self.postMessage(response);
  }

  #handleSuccess(request: WorkerRequest, value: any, transfer: Transferable[] = []) {
    if (!this.#initialized && request.func === 'initialize') {
      this.#initialized = true;
      this.#initializingResolve();
    }

    const response: WorkerResponse = {
      id: request.id,
      status: RESPONSE_STATUS.STATUS_SUCCESS,
      value,
    };

    self.postMessage(response, { transfer });
  }
}

export default SceneWorker;
