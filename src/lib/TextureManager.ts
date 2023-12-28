import * as THREE from 'three';
import { Blp, BLP_IMAGE_FORMAT } from '@wowserhq/format';
import FormatManager from './FormatManager.js';
import { normalizePath } from './util.js';

const THREE_TEXTURE_FORMAT: Record<number, THREE.PixelFormat | THREE.CompressedPixelFormat> = {
  [BLP_IMAGE_FORMAT.IMAGE_DXT1]: THREE.RGBA_S3TC_DXT1_Format,
  [BLP_IMAGE_FORMAT.IMAGE_DXT3]: THREE.RGBA_S3TC_DXT3_Format,
  [BLP_IMAGE_FORMAT.IMAGE_DXT5]: THREE.RGBA_S3TC_DXT5_Format,
  [BLP_IMAGE_FORMAT.IMAGE_ABGR8888]: THREE.RGBAFormat,
};

class TextureManager {
  #formatManager: FormatManager;
  #loaded = new Map<string, THREE.Texture>();
  #loading = new Map<string, Promise<THREE.Texture>>();

  constructor(formatManager: FormatManager) {
    this.#formatManager = formatManager;
  }

  get(
    path: string,
    wrapS: THREE.Wrapping = THREE.RepeatWrapping,
    wrapT: THREE.Wrapping = THREE.RepeatWrapping,
    minFilter: THREE.MinificationTextureFilter = THREE.LinearMipmapLinearFilter,
    magFilter: THREE.MagnificationTextureFilter = THREE.LinearFilter,
  ) {
    const cacheKey = [normalizePath(path), wrapS, wrapT, minFilter, magFilter].join(':');

    const loaded = this.#loaded.get(cacheKey);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loading.get(cacheKey);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#load(cacheKey, path, wrapS, wrapT, minFilter, magFilter);
    this.#loading.set(cacheKey, loading);

    return loading;
  }

  async #load(
    cacheKey: string,
    path: string,
    wrapS: THREE.Wrapping,
    wrapT: THREE.Wrapping,
    minFilter: THREE.MinificationTextureFilter,
    magFilter: THREE.MagnificationTextureFilter,
  ) {
    let blp: Blp;
    try {
      blp = await this.#formatManager.get(path, Blp);
    } catch (error) {
      this.#loading.delete(cacheKey);
      throw error;
    }

    const images = blp.getImages();
    const firstImage = images[0];
    const imageFormat = firstImage.format;

    const threeFormat = THREE_TEXTURE_FORMAT[imageFormat];
    if (threeFormat === undefined) {
      this.#loading.delete(cacheKey);
      throw new Error(`Unsupported texture format: ${imageFormat}`);
    }

    let texture: THREE.CompressedTexture | THREE.DataTexture;
    if (
      imageFormat === BLP_IMAGE_FORMAT.IMAGE_DXT1 ||
      imageFormat === BLP_IMAGE_FORMAT.IMAGE_DXT3 ||
      imageFormat === BLP_IMAGE_FORMAT.IMAGE_DXT5
    ) {
      texture = new THREE.CompressedTexture(
        null,
        blp.width,
        blp.height,
        threeFormat as THREE.CompressedPixelFormat,
      );
    } else if (imageFormat === BLP_IMAGE_FORMAT.IMAGE_ABGR8888) {
      texture = new THREE.DataTexture(
        null,
        blp.width,
        blp.height,
        threeFormat as THREE.PixelFormat,
      );
    }

    texture.mipmaps = images;
    texture.wrapS = wrapS;
    texture.wrapT = wrapT;
    texture.minFilter = minFilter;
    texture.magFilter = magFilter;
    texture.anisotropy = 16;
    texture.name = normalizePath(path).split('/').at(-1);
    texture.userData.cacheKey = cacheKey;

    this.#loaded.set(cacheKey, texture);
    this.#loading.delete(cacheKey);

    return texture;
  }
}

export default TextureManager;

export { TextureManager };
