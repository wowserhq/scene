import { getSizeCategory, getFade } from '../lib/world.js';
import { describe, expect, test } from 'vitest';

describe('world', () => {
  describe('getFade', () => {
    test('should return expected fade for distance of 1000.0 and size category of 0', () => {
      expect(getFade(1000.0, 0)).toBe(0.0);
    });

    test('should return expected fade for distance of 1.0 and size category of 4', () => {
      expect(getFade(1.0, 4)).toBe(1.0);
    });

    test('should return expected fade for distance of 145.0 and size category of 1', () => {
      expect(getFade(145.0, 1)).toBe(0.5);
    });

    test('should return expected fade for distance of 149.999 and size category of 1', () => {
      expect(getFade(149.999, 1)).toBe(0.0);
    });

    test('should return expected fade for distance of 140.001 and size category of 1', () => {
      expect(getFade(140.001, 1)).toBe(1.0);
    });
  });

  describe('getSizeCategory', () => {
    test('should return expected category for size of 0.1', () => {
      expect(getSizeCategory(0.1)).toBe(0);
    });

    test('should return expected category for size of 4.0', () => {
      expect(getSizeCategory(4.0)).toBe(1);
    });
  });
});
