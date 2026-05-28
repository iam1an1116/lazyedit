import type { Point } from '../types';

/**
 * Extract contour points from a portrait image's alpha channel.
 */
export function extractContour(
  image: HTMLImageElement,
  threshold = 30
): Point[] {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  if (w === 0 || h === 0) return [];

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    mask[i] = data[i * 4 + 3] > threshold ? 1 : 0;
  }

  const points: Point[] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 500));

  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const idx = y * w + x;
      if (mask[idx] === 0) continue;
      if (
        mask[idx - 1] === 0 || mask[idx + 1] === 0 ||
        mask[idx - w] === 0 || mask[idx + w] === 0
      ) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

/**
 * Render pattern stroke around the portrait's alpha edge.
 *
 * Strategy (no compositing — uses clipping):
 * 1. Draw expanded portrait (offset copies) onto a temp canvas → dilated shape
 * 2. Use the dilated shape as a clip region on the main canvas
 * 3. Fill the clipped area with the pattern
 * 4. Then erase the original portrait area using destination-out on another temp canvas
 */
export function renderPatternStroke(
  canvas: HTMLCanvasElement,
  portraitImage: HTMLImageElement,
  strokeWidth: number,
  strokeStyle: CanvasRenderingContext2D['strokeStyle']
): void {
  const W = canvas.width;
  const H = canvas.height;
  if (W === 0 || H === 0) return;

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  const half = Math.ceil(strokeWidth / 2);

  // Step 1: Build dilated portrait on temp canvas A
  const canvasA = document.createElement('canvas');
  canvasA.width = W;
  canvasA.height = H;
  const ctxA = canvasA.getContext('2d')!;

  for (let angle = 0; angle < 360; angle += 15) {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.round(Math.cos(rad) * half);
    const dy = Math.round(Math.sin(rad) * half);
    ctxA.drawImage(portraitImage, dx, dy, W, H);
  }

  // Step 2: Build ring on temp canvas B (expanded minus original)
  const canvasB = document.createElement('canvas');
  canvasB.width = W;
  canvasB.height = H;
  const ctxB = canvasB.getContext('2d')!;

  ctxB.drawImage(canvasA, 0, 0);
  ctxB.globalCompositeOperation = 'destination-out';
  ctxB.drawImage(portraitImage, 0, 0, W, H);
  ctxB.globalCompositeOperation = 'source-over';

  // Step 3: Draw ring onto main canvas, then fill with pattern
  // First draw the ring shape (this establishes the alpha mask)
  ctx.drawImage(canvasB, 0, 0);

  // Then fill the ring area with the pattern using source-in
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = strokeStyle;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}
