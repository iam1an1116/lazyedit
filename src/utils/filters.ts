import type { PortraitFilter } from '../types';

/** CSS filter string for live preview */
export function getFilterCSS(filter: PortraitFilter): string {
  switch (filter) {
    case 'normal':
      return 'none';
    case 'silhouette':
      return 'brightness(0) contrast(10)';
    case 'bw':
      return 'grayscale(1) contrast(1.4)';
    case 'glitch':
      return 'none'; // glitch uses multi-layer rendering, not CSS filter
    default:
      return 'none';
  }
}

/**
 * Apply glitch effect on a canvas.
 * Renders the image 3 times with RGB channel isolation and offset.
 */
export function applyGlitchEffect(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
  offset: number = 6
): void {
  // Draw base
  ctx.drawImage(source, 0, 0, width, height);
  const baseData = ctx.getImageData(0, 0, width, height);

  // Create offset copies for R and B channels
  const rCanvas = document.createElement('canvas');
  rCanvas.width = width;
  rCanvas.height = height;
  const rCtx = rCanvas.getContext('2d')!;
  rCtx.drawImage(source, -offset, 0, width, height);

  const bCanvas = document.createElement('canvas');
  bCanvas.width = width;
  bCanvas.height = height;
  const bCtx = bCanvas.getContext('2d')!;
  bCtx.drawImage(source, offset, 0, width, height);

  const rData = rCtx.getImageData(0, 0, width, height);
  const bData = bCtx.getImageData(0, 0, width, height);

  // Merge: R from offset-left, G from center, B from offset-right
  for (let i = 0; i < baseData.data.length; i += 4) {
    baseData.data[i] = rData.data[i];         // R
    // G stays from base
    baseData.data[i + 2] = bData.data[i + 2]; // B
  }

  ctx.putImageData(baseData, 0, 0);
}
