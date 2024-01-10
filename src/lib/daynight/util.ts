/**
 * Returns number of half minutes since midnight.
 */
const getDayNightTime = () => {
  const d = new Date();

  const msSinceMidnight = d.getTime() - d.setHours(0, 0, 0, 0);

  return Math.round(msSinceMidnight / 1000.0 / 30.0);
};

/**
 * Given two values, linearly interpolate between them according to the given factor.
 *
 * @param value1
 * @param value2
 * @param factor
 */
const lerpNumbers = (value1: number, value2: number, factor: number) =>
  (1.0 - factor) * value1 + factor * value2;

/**
 * Given a DayNight table of key/value pairs and a given key, interpolate table values against the
 * key. If the key is in excess of the table's size, interpolate from the last table value to the
 * first table value.
 *
 * @param table
 * @param size
 * @param key
 */
const interpolateDayNightTable = (table: number[], key: number) => {
  // All table entries are key/value pairs
  const size = table.length / 2;

  // Clamp key
  key = Math.min(Math.max(key, 0.0), 1.0);

  let previousKey: number;
  let nextKey: number;
  let previousValue: number;
  let nextValue: number;

  for (let i = 0; i < size; i++) {
    // Wrap at end
    if (i + 1 >= size) {
      previousKey = table[i * 2];
      nextKey = table[0] + 1.0;

      previousValue = table[i * 2 + 1];
      nextValue = table[1];

      break;
    }

    // Found matching stops
    if (table[i * 2] <= key && table[(i + 1) * 2] >= key) {
      previousKey = table[i * 2];
      nextKey = table[(i + 1) * 2];

      previousValue = table[i * 2 + 1];
      nextValue = table[(i + 1) * 2 + 1];

      break;
    }
  }

  const keyDistance = nextKey - previousKey;

  if (Math.abs(keyDistance) < 0.001) {
    return previousValue;
  }

  const factor = (key - previousKey) / keyDistance;

  return lerpNumbers(previousValue, nextValue, factor);
};

export { getDayNightTime, interpolateDayNightTable };
