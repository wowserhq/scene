const workerMessageHandler = (event: MessageEvent) => {
  const id: number = event.data.id;
  const functionName: string = event.data.functionName;
  const functionArgs: any[] = event.data.functionArgs;
  const transfer: Transferable[] = [];

  try {
    const fn = self[functionName];
    const result = fn(...functionArgs);

    if (ArrayBuffer.isView(result)) {
      transfer.push(result.buffer);
    } else if (result instanceof ArrayBuffer) {
      transfer.push(result);
    }

    self.postMessage({ id, result, success: true }, { transfer });
  } catch (error) {
    self.postMessage({ id, result: error, success: false });
  }
};

const workerSetConstants = (constants: Record<string, any>) => {
  for (const [key, value] of Object.entries(constants)) {
    self[key] = value;
  }
};

const contextToInlineUrl = (context: Record<any, any>) => {
  const initializer = [];
  for (const [rawKey, rawValue] of Object.entries(context)) {
    let key = `'${rawKey.toString()}'`;

    let value = rawValue;
    if (typeof rawValue === 'function') {
      value = rawValue.toString();
    } else if (typeof rawValue === 'string' || typeof rawValue === 'object') {
      value = JSON.stringify(rawValue);
    }

    initializer.push(`self[${key}] = `, value, ';', '\n\n');
  }

  initializer.push(`self['setConstants'] = `, workerSetConstants.toString(), ';', '\n\n');
  initializer.push(`self['onmessage'] = `, workerMessageHandler.toString(), ';', '\n');

  const blob = new Blob(initializer, { type: 'text/javascript' });
  return URL.createObjectURL(blob);
};

class SceneWorker {
  #worker: Worker;
  #pending = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();
  #nextId = 0;
  #constants: Record<string, any>;
  #initialized = false;
  #initializing: Promise<void>;

  constructor(name: string, context: Record<any, any>, constants: Record<string, any>) {
    this.#worker = new Worker(contextToInlineUrl(context), { name });
    this.#constants = constants;

    this.#worker.onmessage = (event: MessageEvent) => {
      const id: number = event.data.id;
      const pending = this.#pending.get(id);

      if (event.data.success) {
        pending.resolve(event.data.result);
      } else {
        pending.reject(event.data.result);
      }

      this.#pending.delete(id);
    };
  }

  async call(name: string, ...args: any[]): Promise<any> {
    if (!this.#initialized) {
      if (!this.#initializing) {
        this.#initializing = this.#initialize();
      }

      await this.#initializing;
    }

    return this.#call(name, args);
  }

  #call(name: string, args: any[]): Promise<any> {
    const id = this.#nextId++;

    const promise = new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
    });

    this.#worker.postMessage({ id, functionName: name, functionArgs: args });

    return promise;
  }

  async #initialize() {
    if (this.#constants) {
      await this.#call('setConstants', [this.#constants]);
    }

    this.#initialized = true;
    this.#initializing = null;
  }
}

export default SceneWorker;
export { SceneWorker };
