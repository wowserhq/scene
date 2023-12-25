import { nextFrame, paced, sleep } from '../lib/util';
import { describe, expect, test } from 'vitest';

describe('util', () => {
  describe('nextFrame', () => {
    test('should resolve', async () => {
      await expect(nextFrame()).resolves.toEqual(undefined);
    });
  });

  describe('paced', () => {
    test('should iterate over array in multiple frames when work takes longer than a frame', async () => {
      let frames = 0;
      const countFrame = () => {
        frames++;
        requestAnimationFrame(countFrame);
      };
      requestAnimationFrame(countFrame);

      const elements = [1, 2, 3];
      const iterated = [];
      for await (const element of paced(elements)) {
        await sleep(30);
        iterated.push(element);
      }

      expect(iterated).toEqual(elements);
      expect(frames).toBeGreaterThan(0);
    });

    test('should iterate over array in zero frames when work takes less than a frame', async () => {
      let frames = 0;
      const countFrame = () => {
        frames++;
        requestAnimationFrame(countFrame);
      };
      requestAnimationFrame(countFrame);

      const elements = [1, 2, 3];
      const iterated = [];
      for await (const element of paced(elements)) {
        iterated.push(element);
      }

      expect(iterated).toEqual(elements);
      expect(frames).toBe(0);
    });
  });
});
