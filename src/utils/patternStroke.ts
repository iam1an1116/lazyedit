/**
 * Create a retro polka dots CanvasPattern.
 */
export function createDotsPattern(
  ctx: CanvasRenderingContext2D,
  dotRadius: number,
  spacing: number,
  color: string
): CanvasPattern {
  const size = spacing;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pCtx = patternCanvas.getContext('2d')!;

  pCtx.fillStyle = color;
  pCtx.beginPath();
  pCtx.arc(size / 2, size / 2, dotRadius, 0, Math.PI * 2);
  pCtx.fill();

  return ctx.createPattern(patternCanvas, 'repeat')!;
}

/**
 * Create a 45° zebra stripes CanvasPattern.
 * Alternating black and white diagonal stripes.
 */
export function createStripesPattern(
  ctx: CanvasRenderingContext2D,
  stripeWidth: number,
  _gap: number,
  _angle: number,
  _color: string
): CanvasPattern {
  // Period = one black stripe + one white stripe
  const period = Math.max(4, Math.round(stripeWidth * 2));
  // Tile size needs to be large enough for 45° rotation to tile seamlessly
  const size = period * 4;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pCtx = patternCanvas.getContext('2d')!;

  // White background
  pCtx.fillStyle = '#FFFFFF';
  pCtx.fillRect(0, 0, size, size);

  // Draw 45° black stripes
  pCtx.save();
  pCtx.translate(size / 2, size / 2);
  pCtx.rotate((45 * Math.PI) / 180);
  pCtx.translate(-size / 2, -size / 2);

  pCtx.fillStyle = '#000000';
  for (let i = -size; i < size * 2; i += period) {
    pCtx.fillRect(i, -size, period / 2, size * 3);
  }

  pCtx.restore();

  return ctx.createPattern(patternCanvas, 'repeat')!;
}
