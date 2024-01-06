import { normalizePath } from './util.js';

/**
 * AssetManager provides an in-memory cache for remote assets. Outbound HTTP requests are coalesced
 * into a single request for any given asset path. Assets are cached based on their normalized path
 * name.
 */
class AssetManager {
  #baseUrl: string;
  #normalizePath: boolean;
  #loaded = new globalThis.Map<string, ArrayBuffer>();
  #loading = new globalThis.Map<string, Promise<ArrayBuffer>>();

  constructor(baseUrl: string, normalizePath = true) {
    this.#baseUrl = baseUrl;
    this.#normalizePath = normalizePath;
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  get normalizePath() {
    return this.#normalizePath;
  }

  get(path: string) {
    const cacheKey = normalizePath(path);

    const loaded = this.#loaded.get(cacheKey);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loading.get(cacheKey);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#load(path, cacheKey);
    this.#loading.set(cacheKey, loading);

    return loading;
  }

  async #load(path: string, cacheKey: string) {
    const response = await fetch(this.#getFullUrl(path));

    // Handle non-2xx responses
    if (!response.ok) {
      this.#loading.delete(cacheKey);

      throw new Error(`Error fetching asset: ${response.status} ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    this.#loaded.set(cacheKey, data);

    this.#loading.delete(cacheKey);

    return data;
  }

  #getFullUrl(path: string) {
    const urlPath = this.#normalizePath ? normalizePath(path) : path;
    return `${this.#baseUrl}/${urlPath}`;
  }
}

export default AssetManager;

export { AssetManager };
