/**
 * Returns a promise that settles after the next frame renders. Useful for spacing synchronous
 * work on the main thread.
 */
const nextFrame = () => {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

/**
 * Given an MPQ-style path, return a normalized version of the path with all backslashes turned
 * to forward slashes, leading and trailing whitespace removed, and all characters turned to
 * lowercase.
 *
 * @param path
 */
const normalizePath = (path: string) => path.trim().toLowerCase().replaceAll(/\\/g, '/');

/**
 * Returns an iterator for the given iterable that pauses for an animation frame every time the
 * given pace has elapsed. Useful for pacing synchronous work without excessively blocking the
 * main thread.
 *
 * @param iterable - Any iterable
 * @param paceMs - Length of time in milliseconds before waiting for a frame.
 */
async function* paced<T>(iterable: Iterable<T>, paceMs = 10) {
  let lastFrameMs = Date.now();

  for (const it of iterable) {
    if (Date.now() - lastFrameMs >= paceMs) {
      await nextFrame();
      lastFrameMs = Date.now();
    }

    yield it;
  }
}

const sleep = (timeMs: number) => new Promise((resolve) => setTimeout(resolve, timeMs));

export { nextFrame, normalizePath, paced, sleep };
