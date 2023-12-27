import AssetManager from '../lib/AssetManager';
import { describe, expect, test, vi } from 'vitest';

const createFetchResponse = (status: number, statusText: string, data: ArrayBuffer) => ({
  ok: status >= 200 && status <= 299,
  status,
  statusText,
  arrayBuffer: () => new Promise((resolve) => resolve(data)),
});

describe('AssetManager', () => {
  describe('get', () => {
    test('should return new asset data when not previously loaded', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetData = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(200, 'Okay', assetData));
      globalThis.fetch = mockFetch;

      const returnedAssetData = await assetManager.get('foo');

      expect(returnedAssetData).toEqual(assetData);
    });

    test('should return existing asset data when previously loaded', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetData = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(200, 'Okay', assetData));
      globalThis.fetch = mockFetch;

      const returnedAssetData1 = await assetManager.get('foo');
      const returnedAssetData2 = await assetManager.get('foo');

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(returnedAssetData1).toBe(returnedAssetData2);
    });

    test('should throw when asset data cannot be fetched', async () => {
      const assetManager = new AssetManager('http://example.local', true);
      const assetData = new ArrayBuffer(7);

      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse(404, 'Not Found', assetData));
      globalThis.fetch = mockFetch;

      await expect(assetManager.get('foo')).rejects.toBeInstanceOf(Error);
    });
  });
});
