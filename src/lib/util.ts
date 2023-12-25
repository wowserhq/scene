/**
 * Returns a promise that settles after the next frame renders. Useful for spacing synchronous
 * work on the main thread.
 */
const nextFrame = () => {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

export { nextFrame };
