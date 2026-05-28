/**
 * Scan the portrait image's alpha channel and return the bounding box
 * of non-transparent pixels, mapped to the container's coordinate space.
 */
export async function getPortraitBounds(
  portraitUrl: string,
  containerWidth: number,
  containerHeight: number
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const img = await loadImage(portraitUrl);
  const { naturalWidth: imgW, naturalHeight: imgH } = img;
  if (imgW === 0 || imgH === 0) return null;

  // Scan at a lower resolution for performance
  const scanW = Math.min(imgW, 200);
  const scanH = Math.round(scanW * (imgH / imgW));

  const canvas = document.createElement('canvas');
  canvas.width = scanW;
  canvas.height = scanH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, scanW, scanH);

  const imageData = ctx.getImageData(0, 0, scanW, scanH);
  const data = imageData.data;

  let minX = scanW, minY = scanH, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < scanH; y++) {
    for (let x = 0; x < scanW; x++) {
      if (data[(y * scanW + x) * 4 + 3] > 30) { // alpha > 30
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return null;

  // Convert scan coords to 0-1 ratio
  const rx = minX / scanW;
  const ry = minY / scanH;
  const rw = (maxX - minX) / scanW;
  const rh = (maxY - minY) / scanH;

  // The portrait <img> uses object-cover to fill the container.
  // Calculate the visible area of the image within the container.
  const containerAspect = containerWidth / containerHeight;
  const imgAspect = imgW / imgH;

  let visibleX: number, visibleY: number, visibleW: number, visibleH: number;

  if (imgAspect > containerAspect) {
    // Image is wider: height fills, width is cropped
    visibleH = 1;
    visibleW = containerAspect / imgAspect;
    visibleX = (1 - visibleW) / 2;
    visibleY = 0;
  } else {
    // Image is taller: width fills, height is cropped
    visibleW = 1;
    visibleH = imgAspect / containerAspect;
    visibleX = 0;
    visibleY = (1 - visibleH) / 2;
  }

  // Map portrait bounds through the visible area to container coords
  const cx = (visibleX + rx * visibleW) * containerWidth;
  const cy = (visibleY + ry * visibleH) * containerHeight;
  const cw = rw * visibleW * containerWidth;
  const ch = rh * visibleH * containerHeight;

  return { x: cx, y: cy, width: cw, height: ch };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
