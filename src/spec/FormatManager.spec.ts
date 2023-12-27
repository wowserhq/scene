import FormatManager from '../lib/FormatManager';
import AssetManager from '../lib/AssetManager';
import { describe, expect, Mock, test, vi } from 'vitest';

const getMockAssetManager = () => {
  const assetManager = new AssetManager('http://example.local', true);
  assetManager.get = vi.fn();
  return assetManager;
};

class SimpleFormat {
  #simpleField: number;
  #loaded = false;

  constructor(simpleArg: number) {
    this.#simpleField = simpleArg;
  }

  get simpleField() {
    return this.#simpleField;
  }

  get loaded() {
    return this.#loaded;
  }

  load(data: ArrayBuffer) {
    this.#loaded = true;
    return this;
  }
}

describe('FormatManager', () => {
  describe('get', () => {
    test('should return new format instance when not previously loaded', async () => {
      const mockAssetManager = getMockAssetManager();
      const formatManager = new FormatManager(mockAssetManager);

      const instance = await formatManager.get('foo', SimpleFormat, 7);

      expect(mockAssetManager.get).toHaveBeenCalledWith('foo');
      expect(instance).toBeInstanceOf(SimpleFormat);
      expect(instance.simpleField).toBe(7);
      expect(instance.loaded).toBe(true);
    });

    test('should return new format instance when previously loaded with different constructor args', async () => {
      const mockAssetManager = getMockAssetManager();
      const formatManager = new FormatManager(mockAssetManager);

      const instance1 = await formatManager.get('foo', SimpleFormat, 7);
      const instance2 = await formatManager.get('foo', SimpleFormat, 8);

      expect(mockAssetManager.get).toHaveBeenCalledWith('foo');

      expect(instance1).toBeInstanceOf(SimpleFormat);
      expect(instance1.simpleField).toBe(7);
      expect(instance1.loaded).toBe(true);

      expect(instance2).toBeInstanceOf(SimpleFormat);
      expect(instance2.simpleField).toBe(8);
      expect(instance2.loaded).toBe(true);
      expect(instance2 !== instance1).toBe(true);
    });

    test('should return existing format instance when previously loaded', async () => {
      const mockAssetManager = getMockAssetManager();
      const formatManager = new FormatManager(mockAssetManager);

      const instance1 = await formatManager.get('foo', SimpleFormat, 7);
      const instance2 = await formatManager.get('foo', SimpleFormat, 7);

      expect(mockAssetManager.get).toHaveBeenCalledOnce();
      expect(instance1).toBeInstanceOf(SimpleFormat);
      expect(instance1).toBe(instance2);
    });

    test('should throw when asset data is not available', async () => {
      const mockAssetManager = getMockAssetManager();
      const formatManager = new FormatManager(mockAssetManager);

      (mockAssetManager.get as Mock).mockRejectedValue(new Error('ohno'));

      await expect(formatManager.get('foo', SimpleFormat, 7)).rejects.toBeInstanceOf(Error);
    });
  });
});
