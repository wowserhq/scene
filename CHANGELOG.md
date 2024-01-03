# Changelog

## [0.11.0](https://github.com/wowserhq/scene/compare/v0.10.0...v0.11.0) (2024-01-03)


### Features

* **map:** add support for loading map doodads ([35136d5](https://github.com/wowserhq/scene/commit/35136d5a4c53e4944833aaf7f79f00618011c44d))
* **map:** improve loading times for new map areas ([6011f9a](https://github.com/wowserhq/scene/commit/6011f9a11320803707cef5a060df334af1dad8fb))
* **map:** reduce frustum culling overhead for doodads ([427c80b](https://github.com/wowserhq/scene/commit/427c80b3cc7884aa3de62e7f8d8d70f5b7c620e2))
* **model:** apply fog to models ([7bba5b1](https://github.com/wowserhq/scene/commit/7bba5b152a8b656036ef5349a7a2bd729fc2ef30))

## [0.10.0](https://github.com/wowserhq/scene/compare/v0.9.1...v0.10.0) (2023-12-31)


### Features

* treat three as a peer dependency ([518b92f](https://github.com/wowserhq/scene/commit/518b92f5b413b0ddf4600c72c868de4bfd2c8031))

## [0.9.1](https://github.com/wowserhq/scene/compare/v0.9.0...v0.9.1) (2023-12-31)


### Bug Fixes

* **terrain:** avoid creating meshes for layerless map chunks ([fcbd544](https://github.com/wowserhq/scene/commit/fcbd544066f5ac3cc88080ba9a52f63f0f5a8fa4))

## [0.9.0](https://github.com/wowserhq/scene/compare/v0.8.1...v0.9.0) (2023-12-30)


### Features

* **controls:** add MapControls ([5da0bf3](https://github.com/wowserhq/scene/commit/5da0bf313b1988cda75ab6f1b906792131f37e6b))

## [0.8.1](https://github.com/wowserhq/scene/compare/v0.8.0...v0.8.1) (2023-12-30)


### Bug Fixes

* **terrain:** build default vertex buffer on main thread ([a7bfdd2](https://github.com/wowserhq/scene/commit/a7bfdd2d7f3d268e5386f1590a9af7e6a52b45b8))

## [0.8.0](https://github.com/wowserhq/scene/compare/v0.7.0...v0.8.0) (2023-12-30)


### Features

* **map:** add MapManager ([#18](https://github.com/wowserhq/scene/issues/18)) ([f73d5b1](https://github.com/wowserhq/scene/commit/f73d5b1ea103df16dbfa79aad07ada4d031fc803))

## [0.7.0](https://github.com/wowserhq/scene/compare/v0.6.0...v0.7.0) (2023-12-29)


### Features

* **terrain:** dispose of terrain geometry and materials when no longer in use ([6f5f049](https://github.com/wowserhq/scene/commit/6f5f049d5075bf8dcb99112cc73791896655946a))
* **terrain:** support removal of loaded terrain ([f9da66f](https://github.com/wowserhq/scene/commit/f9da66fbfc97105c679d5dcd4233d7b904e3ffe3))
* **texture:** dispose of textures when no longer in use ([#16](https://github.com/wowserhq/scene/issues/16)) ([f316e96](https://github.com/wowserhq/scene/commit/f316e96ccc18e715a4845d4b6e11955d8551edf1))

## [0.6.0](https://github.com/wowserhq/scene/compare/v0.5.0...v0.6.0) (2023-12-29)


### Features

* **terrain:** avoid unnecessary matrix recalculation for terrain groups ([74997bf](https://github.com/wowserhq/scene/commit/74997bf368da5b25d3179a81b8e58fdbd02c2a77))

## [0.5.0](https://github.com/wowserhq/scene/compare/v0.4.1...v0.5.0) (2023-12-28)


### Features

* add SceneWorker ([#12](https://github.com/wowserhq/scene/issues/12)) ([dbc7b18](https://github.com/wowserhq/scene/commit/dbc7b184581950f0cbf96b1b353c6d5122e86551))
* **terrain:** add TerrainManager ([#14](https://github.com/wowserhq/scene/issues/14)) ([e95e3bc](https://github.com/wowserhq/scene/commit/e95e3bcfff9806c6af5709e6daadd2fe352445c6))

## [0.4.1](https://github.com/wowserhq/scene/compare/v0.4.0...v0.4.1) (2023-12-28)


### Bug Fixes

* **texture:** flag newly created textures for upload ([4b34a05](https://github.com/wowserhq/scene/commit/4b34a05019b833f7b988ac57b216d4ca68e77c07))

## [0.4.0](https://github.com/wowserhq/scene/compare/v0.3.1...v0.4.0) (2023-12-28)


### Features

* **texture:** add TextureManager ([#9](https://github.com/wowserhq/scene/issues/9)) ([6970417](https://github.com/wowserhq/scene/commit/697041762960d28b266671d205eac520bd7f513c))

## [0.3.1](https://github.com/wowserhq/scene/compare/v0.3.0...v0.3.1) (2023-12-27)


### Bug Fixes

* **format:** add missing export for FormatManager ([7062c81](https://github.com/wowserhq/scene/commit/7062c8173bc49ec75c21faba0774b7c5f5be0448))

## [0.3.0](https://github.com/wowserhq/scene/compare/v0.2.1...v0.3.0) (2023-12-27)


### Features

* **asset:** rename getAsset to get ([8e3de54](https://github.com/wowserhq/scene/commit/8e3de549c13b5e5b2624ae7b7d51d9e419480aef))
* **format:** add FormatManager ([#7](https://github.com/wowserhq/scene/issues/7)) ([195df34](https://github.com/wowserhq/scene/commit/195df342e81a7263706d32e00e83cff693cf31d4))

## [0.2.1](https://github.com/wowserhq/scene/compare/v0.2.0...v0.2.1) (2023-12-27)


### Bug Fixes

* add missing types export to package ([dfd24b7](https://github.com/wowserhq/scene/commit/dfd24b7534c2e61b9e17844b29914ea3b93166fe))

## [0.2.0](https://github.com/wowserhq/scene/compare/v0.1.0...v0.2.0) (2023-12-26)


### Features

* **asset:** add AssetManager ([#4](https://github.com/wowserhq/scene/issues/4)) ([b0035f9](https://github.com/wowserhq/scene/commit/b0035f9cb396bd4e4b81b44ca86b247c879404cf))

## 0.1.0 (2023-12-26)

### Features

* initial release
