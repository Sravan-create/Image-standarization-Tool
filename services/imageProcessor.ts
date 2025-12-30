
import { ProcessingSettings, GRID_PRESETS, GridType } from '../types';

/**
 * Standardizes a product image by:
 * 1. Identifying the product bounding box (thresholding out white background).
 * 2. Scaling it to fit within a 'Safe Zone' defined by paddings.
 * 3. Centering it on a new white canvas.
 */
export async function processImage(
  file: File,
  settings: ProcessingSettings
): Promise<{ processedSrc: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const result = performStandardization(img, settings);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function performStandardization(
  img: HTMLImageElement,
  settings: ProcessingSettings
): { processedSrc: string; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  // Step 1: Detect Bounding Box
  // We draw the image to a temporary canvas to analyze pixels
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tempCtx.drawImage(img, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  
  let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
  let found = false;

  // Threshold logic: detect anything that isn't basically white (250+)
  for (let y = 0; y < tempCanvas.height; y++) {
    for (let x = 0; x < tempCanvas.width; x++) {
      const idx = (y * tempCanvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // If pixel is not white and not fully transparent
      if (a > 20 && (r < 252 || g < 252 || b < 252)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  // If nothing found, just use the whole image
  if (!found) {
    minX = 0; minY = 0; maxX = img.width; maxY = img.height;
  }

  const objWidth = maxX - minX;
  const objHeight = maxY - minY;

  // Step 2: Calculate target canvas and safe zone
  const targetW = settings.canvasWidth;
  const targetH = settings.canvasHeight;
  canvas.width = targetW;
  canvas.height = targetH;

  // Fill white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);

  const padding = settings.gridType === GridType.CUSTOM 
    ? settings.customPadding 
    : GRID_PRESETS[settings.gridType];

  const safeZoneW = targetW - padding.left - padding.right;
  const safeZoneH = targetH - padding.top - padding.bottom;

  // Step 3: Scale to Safe Zone
  const scale = Math.min(safeZoneW / objWidth, safeZoneH / objHeight);
  const finalW = objWidth * scale;
  const finalH = objHeight * scale;

  // Step 4: Draw Centered
  const destX = padding.left + (safeZoneW - finalW) / 2;
  const destY = padding.top + (safeZoneH - finalH) / 2;

  ctx.drawImage(
    img,
    minX, minY, objWidth, objHeight, // source
    destX, destY, finalW, finalH    // destination
  );

  return {
    processedSrc: canvas.toDataURL('image/jpeg', 0.95),
    width: targetW,
    height: targetH
  };
}
