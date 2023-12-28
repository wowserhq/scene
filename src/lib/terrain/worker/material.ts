const mergeLayerSplats = (layerSplats: Uint8Array[], width: number, height: number) => {
  const data = new Uint8Array(width * height * 4);

  // Treat each layer splat as a separate color channel
  for (let l = 0; l < layerSplats.length; l++) {
    const layerSplat = layerSplats[l];

    for (let i = 0; i < width * height; i++) {
      data[i * 4 + l] = layerSplat[i];
    }
  }

  return data;
};

export { mergeLayerSplats };
