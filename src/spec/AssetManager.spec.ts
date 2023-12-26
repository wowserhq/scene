import AssetManager from '../lib/AssetManager';
import { describe, expect, test, vi } from 'vitest';

const createFetchResponse = (status: number, statusText: string, data: ArrayBuffer) => ({
  ok: status >= 200 && status <= 299,
  status,
  statusText,
  arrayBuffer: () => new Promise((resolve) => resolve(data)),
});

describe('AssetManager', () => {
  describe('getAsset', () => {
    test('should return expected asset buffer when fetch succeeds', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetBuffer = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(200, 'Okay', assetBuffer));
      globalThis.fetch = mockFetch;

      const returnedAssetBuffer = await assetManager.getAsset('foo');

      expect(returnedAssetBuffer).toEqual(assetBuffer);
    });

    test('should throw when fetch fails', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetBuffer = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(404, 'Not Found', assetBuffer));
      globalThis.fetch = mockFetch;

      await expect(assetManager.getAsset('foo')).rejects.toBeInstanceOf(Error);
    });

    test('should only fetch once for a given asset path', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetBuffer = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(200, 'Okay', assetBuffer));
      globalThis.fetch = mockFetch;

      await assetManager.getAsset('foo');
      await assetManager.getAsset('foo');

      expect(mockFetch).toHaveBeenCalledOnce();
    });
  });
});
