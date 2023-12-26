const normalizePath = (path: string) => path.trim().toLowerCase().replaceAll(/\\/g, '/');

/**
 * AssetManager provides an in-memory cache for game assets. Outbound HTTP requests are coalesced
 * into a single request for any given asset path. Assets are cached based on their normalized path
 * name.
 */
class AssetManager {
  #baseUrl: string;
  #normalizePath: boolean;
  #cache = new globalThis.Map<string, ArrayBuffer>();
  #pendingRequests = new globalThis.Map<string, Promise<ArrayBuffer>>();

  constructor(baseUrl: string, normalizePath = true) {
    this.#baseUrl = baseUrl;
    this.#normalizePath = normalizePath;
  }

  getAsset(path: string) {
    const cacheKey = normalizePath(path);

    const cachedAsset = this.#cache.get(cacheKey);
    if (cachedAsset) {
      return Promise.resolve(cachedAsset);
    }

    const pendingAssetRequest = this.#pendingRequests.get(cacheKey);
    if (pendingAssetRequest) {
      return pendingAssetRequest;
    }

    const newAssetRequest = this.#getMissingAsset(path, cacheKey);
    this.#pendingRequests.set(cacheKey, newAssetRequest);

    return newAssetRequest;
  }

  async #getMissingAsset(path: string, cacheKey: string) {
    const response = await fetch(this.#getFullUrl(path));

    // Handle non-2xx responses
    if (!response.ok) {
      this.#pendingRequests.delete(cacheKey);

      throw new Error(`Error fetching asset: ${response.status} ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    this.#cache.set(cacheKey, data);

    this.#pendingRequests.delete(cacheKey);

    return data;
  }

  #getFullUrl(path: string) {
    const urlPath = this.#normalizePath ? normalizePath(path) : path;
    return `${this.#baseUrl}/${urlPath}`;
  }
}

export default AssetManager;

export { AssetManager };
