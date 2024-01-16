import * as THREE from 'three';
import { SoundEntriesRecord, ZoneMusicRecord } from '@wowserhq/format';
import { SOUND_AMBIENCE } from './const.js';
import { getRandomInt } from './util.js';

class ZoneMusic {
  #musicRecord: ZoneMusicRecord;
  #soundRecords: SoundEntriesRecord[];
  #sounds: Record<string, AudioBuffer>;
  #ambience: SOUND_AMBIENCE;
  #audioSource: THREE.Audio;
  #scheduleTimeout: ReturnType<typeof setTimeout>;
  #lastPlayed: number;

  constructor(audioSource: THREE.Audio) {
    this.#audioSource = audioSource;
    this.#ambience = SOUND_AMBIENCE.AMBIENCE_DAY;
  }

  get ambience() {
    return this.#ambience;
  }

  set ambience(ambience: SOUND_AMBIENCE) {
    this.#ambience = ambience;
  }

  resume() {
    this.#schedule();
  }

  stop() {
    this.#audioSource.stop();
    this.#audioSource.onEnded = null;

    this.suspend();
  }

  suspend() {
    clearTimeout(this.#scheduleTimeout);
    this.#scheduleTimeout = null;
  }

  update(
    musicRecord: ZoneMusicRecord,
    soundRecords: SoundEntriesRecord[],
    sounds: Record<string, AudioBuffer>,
  ) {
    this.#musicRecord = musicRecord;
    this.#soundRecords = soundRecords;
    this.#sounds = sounds;
  }

  #play() {
    const soundEntries = this.#soundRecords[this.#ambience];
    const soundFiles = soundEntries.file.filter((file) => file.trim().length > 0);

    // TODO use freq as weight
    const soundFile = soundFiles[getRandomInt(0, soundFiles.length - 1)];

    const soundBuffer = this.#sounds[soundFile];
    this.#audioSource.setBuffer(soundBuffer);

    this.#audioSource.onEnded = () => {
      this.#audioSource.isPlaying = false;
      this.#lastPlayed = Date.now();
      this.#scheduleTimeout = null;

      this.#schedule();
    };

    this.#audioSource.play();
  }

  #schedule() {
    if (this.#audioSource.isPlaying || this.#scheduleTimeout) {
      return;
    }

    const silenceMin = this.#musicRecord.silenceIntervalMin[this.#ambience];
    const silenceMax = this.#musicRecord.silenceIntervalMax[this.#ambience];
    const silence = getRandomInt(silenceMin, silenceMax);

    // Truncate silence by last played
    const elapsed = this.#lastPlayed ? Date.now() - this.#lastPlayed : 0;
    const delay = Math.max(silence - elapsed, 0);

    this.#scheduleTimeout = setTimeout(() => this.#play(), delay);
  }
}

export default ZoneMusic;
