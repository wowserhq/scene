import * as THREE from 'three';
import { ClientDb, SoundEntriesRecord, ZoneMusicRecord } from '@wowserhq/format';
import DbManager from '../db/DbManager.js';
import { AssetHost, loadAsset, normalizePath } from '../asset.js';
import ZoneMusic from './ZoneMusic.js';
import zoneMusic from './ZoneMusic.js';

type SoundManagerOptions = {
  host: AssetHost;
  dbManager?: DbManager;
};

class SoundManager {
  #host: AssetHost;

  #loadedSounds = new Map<string, AudioBuffer>();
  #loadingSounds = new Map<string, Promise<AudioBuffer>>();

  #context: AudioContext;
  #listener: THREE.AudioListener;
  #camera: THREE.Camera;

  #dbManager: DbManager;
  #zoneMusicDb: ClientDb<ZoneMusicRecord>;
  #soundEntriesDb: ClientDb<SoundEntriesRecord>;

  #desiredZoneMusicId: number;
  #currentZoneMusicId: number;
  #zoneMusic: ZoneMusic;

  #musicSource: THREE.Audio;

  constructor(options: SoundManagerOptions) {
    this.#host = options.host;
    this.#dbManager = options.dbManager ?? new DbManager({ host: options.host });

    this.#context = THREE.AudioContext.getContext();
    this.#listener = new THREE.AudioListener();
    this.#musicSource = new THREE.Audio(this.#listener);
    this.#zoneMusic = new ZoneMusic(this.#musicSource);

    this.#loadDbs().catch((error) => console.error(error));
    this.#syncZoneMusic().catch((error) => console.error(error));
  }

  get camera() {
    return this.#camera;
  }

  set camera(camera: THREE.Camera) {
    this.#camera = camera;
    this.#camera.add(this.#listener);
  }

  setZoneMusic(zoneMusicId: number) {
    this.#desiredZoneMusicId = zoneMusicId;
  }

  async #loadDbs() {
    this.#zoneMusicDb = await this.#dbManager.get('ZoneMusic.dbc', ZoneMusicRecord);
    this.#soundEntriesDb = await this.#dbManager.get('SoundEntries.dbc', SoundEntriesRecord);
  }

  async #syncZoneMusic() {
    if (!this.#zoneMusicDb || !this.#soundEntriesDb) {
      requestAnimationFrame(() => this.#syncZoneMusic().catch((error) => console.error(error)));
      return;
    }

    if (this.#desiredZoneMusicId !== this.#currentZoneMusicId) {
      await this.#updateZoneMusic(this.#desiredZoneMusicId);
    }

    requestAnimationFrame(() => this.#syncZoneMusic().catch((error) => console.error(error)));
  }

  async #updateZoneMusic(zoneMusicId: number) {
    if (this.#currentZoneMusicId === zoneMusicId) {
      return;
    }

    // Let current zone music finish gracefully
    this.#zoneMusic.suspend();

    const musicRecord = this.#zoneMusicDb.getRecord(zoneMusicId);
    if (!musicRecord) {
      this.#currentZoneMusicId = zoneMusicId;
      return;
    }

    const soundRecords = musicRecord.sounds.map((soundEntriesId) =>
      this.#soundEntriesDb.getRecord(soundEntriesId),
    );

    const sounds = {};
    for (const soundRecord of soundRecords) {
      for (const file of soundRecord.file) {
        if (file.trim().length === 0) {
          continue;
        }

        const path = `${soundRecord.directoryBase}\\${file.trim()}`;
        const buffer = await this.#getSound(path);
        sounds[file] = buffer;
      }
    }

    this.#zoneMusic.update(musicRecord, soundRecords, sounds);

    // Resume with new zone music
    this.#zoneMusic.resume();

    this.#currentZoneMusicId = zoneMusicId;
  }

  #getSound(path: string): Promise<AudioBuffer> {
    const refId = normalizePath(path);

    const loaded = this.#loadedSounds.get(refId);
    if (loaded) {
      return Promise.resolve(loaded);
    }

    const alreadyLoading = this.#loadingSounds.get(refId);
    if (alreadyLoading) {
      return alreadyLoading;
    }

    const loading = this.#loadSound(refId, path);
    this.#loadingSounds.set(refId, loading);

    return loading;
  }

  async #loadSound(refId: string, path: string) {
    let buffer: AudioBuffer;
    try {
      const data = await loadAsset(this.#host, path);
      buffer = await this.#context.decodeAudioData(data);

      this.#loadedSounds.set(refId, buffer);
    } finally {
      this.#loadingSounds.delete(refId);
    }

    return buffer;
  }
}

export default SoundManager;
export { SoundManager };
