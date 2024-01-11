import * as THREE from 'three';

/**
 * Returns number of half minutes since midnight.
 */
const getDayNightTime = () => {
  const d = new Date();

  const msSinceMidnight = d.getTime() - d.setHours(0, 0, 0, 0);

  return Math.round(msSinceMidnight / 1000.0 / 30.0);
};

/**
 * Given two numbers, linearly interpolate between them according to the given factor.
 *
 * @param value1 - First number
 * @param value2 - Second number
 * @param factor - Interpolation factor
 */
const lerpNumbers = (value1: number, value2: number, factor: number) =>
  (1.0 - factor) * value1 + factor * value2;

/**
 * Given two colors, linearly interpolate between them according to the given factor.
 *
 * @param value1 - First color
 * @param value2 - Second color
 * @param factor - Interpolation factor
 * @param color - Destination color object used to store the result of the interpolation
 */
const lerpColors = (value1: THREE.Color, value2: THREE.Color, factor: number, color: THREE.Color) =>
  color.lerpColors(value1, value2, factor);

const getTableKeys = (table: any[], key: number) => {
  // All table entries are key/value pairs
  const size = table.length / 2;

  // Clamp key
  key = Math.min(Math.max(key, 0.0), 1.0);

  let previous: number;
  let previousKey: number;
  let next: number;
  let nextKey: number;

  for (let i = 0; i < size; i++) {
    // Wrap at end
    if (i + 1 >= size) {
      previous = i;
      previousKey = table[previous * 2];

      next = 0;
      nextKey = table[0] + 1.0;

      break;
    }

    // Found matching stops
    if (table[i * 2] <= key && table[(i + 1) * 2] >= key) {
      previous = i;
      previousKey = table[previous * 2];

      next = i + 1;
      nextKey = table[next * 2];

      break;
    }
  }

  return { previous, previousKey, next, nextKey };
};

/**
 * Given a table of key/value pairs with color values and a key, interpolate table values against
 * the key. If the key is in excess of the table's size, interpolate from the last table value to
 * the first table value.
 *
 * @param table
 * @param key
 * @param color
 */
const interpolateColorTable = (table: any[], key: number, color: THREE.Color): void => {
  const { previous, previousKey, next, nextKey } = getTableKeys(table, key);

  const previousValue = table[previous * 2 + 1];
  const nextValue = table[next * 2 + 1];

  const keyDistance = nextKey - previousKey;

  if (Math.abs(keyDistance) < 0.001) {
    return previousValue;
  }

  const factor = (key - previousKey) / keyDistance;

  lerpColors(previousValue, nextValue, factor, color);
};

/**
 * Given a table of key/value pairs with numeric values and a key, interpolate table values against
 * the key. If the key is in excess of the table's size, interpolate from the last table value to
 * the first table value.
 *
 * @param table
 * @param key
 */
const interpolateNumericTable = (table: any[], key: number): number => {
  const { previous, previousKey, next, nextKey } = getTableKeys(table, key);

  const previousValue = table[previous * 2 + 1];
  const nextValue = table[next * 2 + 1];

  const keyDistance = nextKey - previousKey;

  if (Math.abs(keyDistance) < 0.001) {
    return previousValue;
  }

  const factor = (key - previousKey) / keyDistance;

  return lerpNumbers(previousValue, nextValue, factor);
};

export { getDayNightTime, interpolateColorTable, interpolateNumericTable };
