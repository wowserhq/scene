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
    test('should return expected asset data when fetch succeeds', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetData = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(200, 'Okay', assetData));
      globalThis.fetch = mockFetch;

      const returnedAssetData = await assetManager.get('foo');

      expect(returnedAssetData).toEqual(assetData);
    });

    test('should throw when fetch fails', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetData = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(404, 'Not Found', assetData));
      globalThis.fetch = mockFetch;

      await expect(assetManager.get('foo')).rejects.toBeInstanceOf(Error);
    });

    test('should only fetch once for a given asset path', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetData = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(200, 'Okay', assetData));
      globalThis.fetch = mockFetch;

      await assetManager.get('foo');
      await assetManager.get('foo');

      expect(mockFetch).toHaveBeenCalledOnce();
    });
  });
});
