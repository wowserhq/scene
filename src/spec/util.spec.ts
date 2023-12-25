import { nextFrame } from '../lib';
import { describe, expect, test } from 'vitest';

describe('util', () => {
  describe('nextFrame', () => {
    test('should resolve', async () => {
      await expect(nextFrame()).resolves.toEqual(undefined);
    });
  });
});
