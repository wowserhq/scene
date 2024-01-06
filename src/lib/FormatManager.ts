import AssetManager from './AssetManager.js';
import { normalizePath } from './util.js';

interface FormatConstructor<T> {
  new (...args: any[]): T;
}

interface Format<T> {
  load: (data: ArrayBuffer) => T;
}

class FormatManager {
  #assetManager: AssetManager;
  #loaded = new Map<string, any>();
  #loading = new Map<string, Promise<any>>();

  constructor(assetManager: AssetManager) {
    this.#assetManager = assetManager;
  }

  get baseUrl() {
    return this.#assetManager.baseUrl;
  }

  get normalizePath() {
    return this.#assetManager.normalizePath;
  }

  get<T extends Format<T>>(
    path: string,
    FormatClass: FormatConstructor<T>,
    ...formatConstructorArgs: any[]
  ): Promise<T> {
    const cacheKey = [
      normalizePath(path),
      FormatClass.prototype.constructor.name,
      formatConstructorArgs,
    ].join(':');

    const loaded = this.#loaded.get(cacheKey);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loading.get(cacheKey);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#load(cacheKey, path, FormatClass, formatConstructorArgs);
    this.#loading.set(cacheKey, loading);

    return loading;
  }

  async #load<T extends Format<T>>(
    cacheKey: string,
    path: string,
    FormatClass: FormatConstructor<T>,
    formatConstructorArgs: any[],
  ): Promise<T> {
    let instance: T;
    try {
      const data = await this.#assetManager.get(path);
      instance = new FormatClass(...formatConstructorArgs).load(data);

      this.#loaded.set(cacheKey, instance);
    } finally {
      this.#loading.delete(cacheKey);
    }

    return instance;
  }
}

export default FormatManager;

export { FormatManager };
