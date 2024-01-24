import * as THREE from 'three';
import { M2Track } from '@wowserhq/format';
import { SequenceSpec } from './loader/types.js';

interface Constructor<T> {
  new (...args: any[]): T;
}

class ModelAnimator {
  #mixer: THREE.AnimationMixer;

  #loops: number[] = [];
  #loopClips: THREE.AnimationClip[] = [];

  #sequences: SequenceSpec[] = [];
  #sequenceClips: THREE.AnimationClip[] = [];

  constructor(root: THREE.Object3D, loops: Uint32Array, sequences: SequenceSpec[]) {
    this.#mixer = new THREE.AnimationMixer(root);
    this.#mixer.timeScale = 1000;

    for (const loop of loops) {
      this.#registerLoop(loop);
    }

    for (const sequence of sequences) {
      this.#registerSequence(sequence);
    }
  }

  get loops() {
    return this.#loops;
  }

  get sequences() {
    return this.#sequences;
  }

  clearAction(action: THREE.AnimationAction) {
    action.stop();
    this.#mixer.uncacheAction(action.getClip());
  }

  update(deltaTime: number) {
    this.#mixer.update(deltaTime);
  }

  getLoop(root: THREE.Object3D, index: number) {
    const clip = this.#loopClips[index];
    return this.#mixer.clipAction(clip, root);
  }

  getSequence(root: THREE.Object3D, index: number) {
    const clip = this.#sequenceClips[index];
    return this.#mixer.clipAction(clip, root);
  }

  registerTrack<T extends THREE.TypedArray>(
    name: string,
    track: M2Track<T>,
    TrackType: Constructor<THREE.KeyframeTrack>,
    transform?: (value: any) => any,
  ) {
    // Empty track
    if (track.sequenceTimes.length === 0 || track.sequenceKeys.length === 0) {
      return;
    }

    if (track.loopIndex === 0xffff) {
      this.#registerSequenceTrack(name, track, TrackType, transform);
    } else {
      this.#registerLoopTrack(name, track, TrackType, transform);
    }
  }

  #registerLoopTrack<T extends THREE.TypedArray>(
    name: string,
    track: M2Track<T>,
    TrackType: Constructor<THREE.KeyframeTrack>,
    transform?: (value: any) => any,
  ) {
    const clip = this.#loopClips[track.loopIndex];

    for (let s = 0; s < track.sequenceTimes.length; s++) {
      const times = track.sequenceTimes[s];
      const values = transform
        ? Array.from(track.sequenceKeys[s]).map((value) => transform(value))
        : track.sequenceKeys[s];

      // Empty loop
      if (times.length === 0 || values.length === 0) {
        continue;
      }

      clip.tracks.push(new TrackType(name, times, values));
    }
  }

  #registerSequenceTrack<T extends THREE.TypedArray>(
    name: string,
    track: M2Track<T>,
    TrackType: Constructor<THREE.KeyframeTrack>,
    transform?: (value: any) => any,
  ) {
    for (let s = 0; s < track.sequenceTimes.length; s++) {
      const clip = this.#sequenceClips[s];

      const times = track.sequenceTimes[s];
      const values = transform
        ? Array.from(track.sequenceKeys[s]).map((value) => transform(value))
        : track.sequenceKeys[s];

      // Empty sequence
      if (times.length === 0 || values.length === 0) {
        continue;
      }

      clip.tracks.push(new TrackType(name, times, values));
    }
  }

  #registerLoop(duration: number) {
    const index = this.#loops.length;
    this.#loops[index] = duration;
    this.#loopClips[index] = new THREE.AnimationClip(`loop-${index}`, duration, []);
  }

  #registerSequence(spec: SequenceSpec) {
    const index = this.#sequences.length;
    this.#sequences[index] = spec;
    this.#sequenceClips[index] = new THREE.AnimationClip(`sequence-${index}`, spec.duration, []);
  }
}

export default ModelAnimator;
