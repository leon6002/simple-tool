const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    const cleanup = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
    };

    const onLoad = () => {
      cleanup();
      resolve(image);
    };

    const onError = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };

    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onError, { once: true });
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;

    // Add timeout to prevent hanging
    setTimeout(() => {
      if (!image.complete) {
        cleanup();
        reject(new Error('Image loading timeout'));
      }
    }, 30000); // 30 second timeout
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to get 2D context from canvas");
    }

    // Validate crop dimensions
    if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
      throw new Error("Invalid crop dimensions");
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    // Limit canvas size to prevent memory issues
    const MAX_CANVAS_SIZE = 4096;
    const scaleX = Math.min(1, MAX_CANVAS_SIZE / bBoxWidth);
    const scaleY = Math.min(1, MAX_CANVAS_SIZE / bBoxHeight);
    const scale = Math.min(scaleX, scaleY);

    // set canvas size to match the bounding box (with scaling if needed)
    canvas.width = bBoxWidth * scale;
    canvas.height = bBoxHeight * scale;

    // apply scaling to context if needed
    if (scale < 1) {
      ctx.scale(scale, scale);
    }

    // enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0);

    // As blob with object URL
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (file) => {
          if (file) {
            resolve(URL.createObjectURL(file));
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/png",
        0.95 // quality parameter
      );
    });
  } catch (error) {
    throw new Error(
      `Failed to crop image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}