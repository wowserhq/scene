# Changelog

## [0.30.0](https://github.com/wowserhq/scene/compare/v0.29.0...v0.30.0) (2024-02-05)


### Features

* **map:** fade doodads in and out based on distance ([199ec9e](https://github.com/wowserhq/scene/commit/199ec9e58d0442ce49588905152b5c4cf7fe7757))
* **model:** improve anti-aliasing for models using alpha-keyed blending ([0d0032b](https://github.com/wowserhq/scene/commit/0d0032ba5eda87f7c514864de144b23e1a156ff4))
* **world:** add fade constants and scaling logic ([42cc70a](https://github.com/wowserhq/scene/commit/42cc70ae3b71197e727ea6c41623c34f12c73b1c))


### Bug Fixes

* **model:** correct alpha handling using separate blend func ([b96720c](https://github.com/wowserhq/scene/commit/b96720c04688c765693e99a9cfef53fed829bec1))

## [0.29.0](https://github.com/wowserhq/scene/compare/v0.28.0...v0.29.0) (2024-02-01)


### Features

* **map:** pause doodad animations when doodads aren't visible ([89ba316](https://github.com/wowserhq/scene/commit/89ba316048f451d752854995419014aee5b52dbc))
* **model:** use track types to determine interpolation mode ([9026ae6](https://github.com/wowserhq/scene/commit/9026ae67afeacfb6f4744860691a5d56087957a0))


### Bug Fixes

* **map:** avoid loading multiple copies of the same doodad ([d7e7323](https://github.com/wowserhq/scene/commit/d7e73236e378502b68a7f6319793455d7d1f6d4f))
* **model:** account for sequence bounds when culling models ([7f9e0e6](https://github.com/wowserhq/scene/commit/7f9e0e62ffe7b7cb962a8a049589d052a19e142e))
* **model:** correct light calculations for double-sided materials ([f7021b0](https://github.com/wowserhq/scene/commit/f7021b073a3b6d007ac4a9f7db2e4e2747dc3156))

## [0.28.0](https://github.com/wowserhq/scene/compare/v0.27.0...v0.28.0) (2024-01-27)


### Features

* **model:** add skinning and bone animations ([626073c](https://github.com/wowserhq/scene/commit/626073cc3924f132118eb87d3861b83ed72d1706))
* **model:** add support for color animations ([3e4e4c1](https://github.com/wowserhq/scene/commit/3e4e4c18e870a5c7b2eafe38fa4855f78e60f870))

## [0.27.0](https://github.com/wowserhq/scene/compare/v0.26.0...v0.27.0) (2024-01-24)


### Features

* **map:** dispose of model animations when removing area doodads ([bcd6b0d](https://github.com/wowserhq/scene/commit/bcd6b0d7e39be7a903658b37c5ec7d45c48e9a32))
* **model:** add support for texture weight and transform animations ([a68e2ce](https://github.com/wowserhq/scene/commit/a68e2ce1605b8f1053113e61a4d15efd0a495a3b))

## [0.26.0](https://github.com/wowserhq/scene/compare/v0.25.0...v0.26.0) (2024-01-22)


### Features

* **model:** add mod + add combiner to fragment shader ([3218452](https://github.com/wowserhq/scene/commit/321845205644df9f67d4238c254b6f6e0a623760))
* **model:** add mod + mod combiner to fragment shader ([714dda3](https://github.com/wowserhq/scene/commit/714dda3923b3164e9e37775e09cdb005e601e318))
* **model:** add mod + mod2x combiner to fragment shader ([b881cf3](https://github.com/wowserhq/scene/commit/b881cf329feaa541d5e379e8070159b17087ca2d))
* **model:** add mod + opaque combiner to fragment shader ([95f4534](https://github.com/wowserhq/scene/commit/95f453484b03c79ce7e1a4aa3d823b7e1812018b))
* **model:** add opaque + add alpha alpha combiner to fragment shader ([244ac8c](https://github.com/wowserhq/scene/commit/244ac8c84c1c43ea046c7b50bc13566adff89202))
* **model:** add opaque + mod2xna alpha combiner to fragment shader ([645a5ee](https://github.com/wowserhq/scene/commit/645a5ee761acecd7182277942f8cfbf2aadd32ce))
* **model:** add opaque + opaque combiner to fragment shader ([cbe64db](https://github.com/wowserhq/scene/commit/cbe64dbc390e165d505d4dfb881e5e4c0caebff9))


### Bug Fixes

* **model:** correct handling of texture coordinate inputs in vertex shaders ([664ab41](https://github.com/wowserhq/scene/commit/664ab41132191e12104ad473778c07857e41ca7e))

## [0.25.0](https://github.com/wowserhq/scene/compare/v0.24.1...v0.25.0) (2024-01-22)


### Features

* **model:** improve shader selection logic ([#57](https://github.com/wowserhq/scene/issues/57)) ([b465b5c](https://github.com/wowserhq/scene/commit/b465b5c13c6c4e1caf4f79e8ef027674c03a0bfa))
* **model:** overhaul material handling for models ([74e7764](https://github.com/wowserhq/scene/commit/74e7764e56895f9dce97357c06316adb08698aa9))

## [0.24.1](https://github.com/wowserhq/scene/compare/v0.24.0...v0.24.1) (2024-01-17)


### Bug Fixes

* **map:** use parent zone music if subzone music isn't set ([7ab94ca](https://github.com/wowserhq/scene/commit/7ab94cad555ca3c4759fbe999d688a0d8b33af27))

## [0.24.0](https://github.com/wowserhq/scene/compare/v0.23.0...v0.24.0) (2024-01-17)


### Features

* **map:** add initial implementation of dispose ([f569dbe](https://github.com/wowserhq/scene/commit/f569dbe2f9671b83792dde0928607a662866e115))

## [0.23.0](https://github.com/wowserhq/scene/compare/v0.22.0...v0.23.0) (2024-01-17)


### Features

* **map:** adjust zone music behavior to match client ([75f831a](https://github.com/wowserhq/scene/commit/75f831adacf5f947c36ffb5c9bfbc8c5d2a8afa4))

## [0.22.0](https://github.com/wowserhq/scene/compare/v0.21.0...v0.22.0) (2024-01-16)


### Features

* **map:** play zone music when available ([5559c88](https://github.com/wowserhq/scene/commit/5559c881f7c4a527ef8d71dd95bb8b815581effc))

## [0.21.0](https://github.com/wowserhq/scene/compare/v0.20.0...v0.21.0) (2024-01-15)


### Features

* **map:** compute terrain bounds in loader instead of main thread ([c7d5e9b](https://github.com/wowserhq/scene/commit/c7d5e9befc6c627d4788d79be2d7a9109359f81f))
* **model:** load model bounds instead of computing them ([a8e30f5](https://github.com/wowserhq/scene/commit/a8e30f51d618b57d5d8b869bede2be1c0b01c8dc))

## [0.20.0](https://github.com/wowserhq/scene/compare/v0.19.0...v0.20.0) (2024-01-14)


### Features

* **map:** emit area:change events when appropriate ([9dfffb2](https://github.com/wowserhq/scene/commit/9dfffb25f7c82ba9329da31a2c4821efafc74a83))


### Bug Fixes

* **map:** prevent exception when no area lights exist for a given map ([064c107](https://github.com/wowserhq/scene/commit/064c107638691bd7db1b88e0ca285679127732c4))

## [0.19.0](https://github.com/wowserhq/scene/compare/v0.18.0...v0.19.0) (2024-01-13)


### Features

* **map:** shift camera frustum modification out of map manager ([c8d164c](https://github.com/wowserhq/scene/commit/c8d164c724d5c9cbd49801cfaa3c751b0e1d6fda))


### Bug Fixes

* **map:** correct sort order when selecting lights ([7a33fdb](https://github.com/wowserhq/scene/commit/7a33fdb99cb3318cee9dfd44a9d5e3230f847822))

## [0.18.0](https://github.com/wowserhq/scene/compare/v0.17.0...v0.18.0) (2024-01-13)


### Features

* **map:** blend area lights based on falloff ([06419d9](https://github.com/wowserhq/scene/commit/06419d927be1e7c76d2b440c544ac5cf6c6549c1))
* **map:** reduce view distance based on fog end ([07996e5](https://github.com/wowserhq/scene/commit/07996e5e62327e37d9d2b973f5d29c9d6aabc33f))

## [0.17.0](https://github.com/wowserhq/scene/compare/v0.16.1...v0.17.0) (2024-01-11)


### Features

* **daynight:** add initial DayNight implementation ([479724c](https://github.com/wowserhq/scene/commit/479724c1c402f86169e89ae81d5890818d059552))
* **daynight:** use clock to set daynight progression ([a0c157d](https://github.com/wowserhq/scene/commit/a0c157dc3e27fb83ddb3a0b97677ac8e3d8e7dfe))
* **map:** make daynight private to map classes ([528027f](https://github.com/wowserhq/scene/commit/528027f44a343aacbfb5de6ec86bcdf0b2d310bf))
* **map:** use area lights ([#43](https://github.com/wowserhq/scene/issues/43)) ([b7b0f38](https://github.com/wowserhq/scene/commit/b7b0f382c511c8a51036bd47a62f9320b9b0f8e0))

## [0.16.1](https://github.com/wowserhq/scene/compare/v0.16.0...v0.16.1) (2024-01-08)


### Bug Fixes

* **map:** prevent transferable errors when loading map areas ([67e7708](https://github.com/wowserhq/scene/commit/67e770886680b58c7b0af1eede8b15b75444470d))

## [0.16.0](https://github.com/wowserhq/scene/compare/v0.15.0...v0.16.0) (2024-01-08)


### Features

* adjust fog logic to match game ([6ca4dcb](https://github.com/wowserhq/scene/commit/6ca4dcb26dcfa26ec733aed45393e677c58c3485))


### Bug Fixes

* transform normals for lighting ([4c4d351](https://github.com/wowserhq/scene/commit/4c4d3517234deee1d7b67000ab16f9ff32e7e943))

## [0.15.0](https://github.com/wowserhq/scene/compare/v0.14.0...v0.15.0) (2024-01-07)


### Features

* **map:** move map loading into worker ([#33](https://github.com/wowserhq/scene/issues/33)) ([86189e5](https://github.com/wowserhq/scene/commit/86189e5e78cf3f7aaf3e01649fbe6133a5817ff5))

## [0.14.0](https://github.com/wowserhq/scene/compare/v0.13.1...v0.14.0) (2024-01-06)


### Features

* **build:** remove commonjs build from published package ([#29](https://github.com/wowserhq/scene/issues/29)) ([fac62a2](https://github.com/wowserhq/scene/commit/fac62a2b5699d8a4d107da8e99f552b2ed2b1cb4))
* improve manager config ([#31](https://github.com/wowserhq/scene/issues/31)) ([296942b](https://github.com/wowserhq/scene/commit/296942b198a932c930264db2641b058acbe3a4c7))
* **map:** add option to control view distance for maps ([99c57d1](https://github.com/wowserhq/scene/commit/99c57d11bfd11cd4ee31b8e8e8f4bedabe6e2a73))
* **model:** handle depth test and depth write material flags ([92262ae](https://github.com/wowserhq/scene/commit/92262aee2b7f09fe3e3c6935029edf740b6fb95d))
* **model:** improve alpha test handling in model materials ([8a9bdc6](https://github.com/wowserhq/scene/commit/8a9bdc63bee00fcaaf30e9d4545d7eb1f72f6e97))
* **model:** move model loading into worker ([#30](https://github.com/wowserhq/scene/issues/30)) ([1b11362](https://github.com/wowserhq/scene/commit/1b11362bf584f2a0203ee421f4a5da24d8696824))
* **texture:** move texture loading into worker ([#32](https://github.com/wowserhq/scene/issues/32)) ([28af560](https://github.com/wowserhq/scene/commit/28af560d4c15b92632044678aaf310bc07f2e0d2))

## [0.13.1](https://github.com/wowserhq/scene/compare/v0.13.0...v0.13.1) (2024-01-04)


### Bug Fixes

* **map:** correct rotation of doodads when placing on map ([da74d4b](https://github.com/wowserhq/scene/commit/da74d4b1ed2460705850fd21041626e50ce1e3b5))

## [0.13.0](https://github.com/wowserhq/scene/compare/v0.12.0...v0.13.0) (2024-01-03)


### Features

* **map:** improve doodad loading speed ([a8849bb](https://github.com/wowserhq/scene/commit/a8849bb624600a9896898eca63190108707a36ee))

## [0.12.0](https://github.com/wowserhq/scene/compare/v0.11.0...v0.12.0) (2024-01-03)


### Features

* **terrain:** improve terrain loading speed ([a524995](https://github.com/wowserhq/scene/commit/a524995f73ec5e246ed395c248f36c77b7ebc7ec))


### Bug Fixes

* **map:** correct z-axis rotation for map doodads ([b17070f](https://github.com/wowserhq/scene/commit/b17070fe9cc4bc6e2520235a17846058b4d01694))

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
