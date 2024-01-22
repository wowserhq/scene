const getBoundsCenter = (extent: Float32Array) => {
  const center = new Float32Array(3);

  center[0] = (extent[0] + extent[3]) * 0.5;
  center[1] = (extent[1] + extent[4]) * 0.5;
  center[2] = (extent[2] + extent[5]) * 0.5;

  return center;
};

export { getBoundsCenter };
