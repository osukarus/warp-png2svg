declare module "imagetracerjs" {
  const ImageTracer: {
    imagedataToSVG: (
      imageData: ImageData,
      options?: any
    ) => string
  }
  export default ImageTracer
}

