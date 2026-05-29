/**
 * Create a retro polka dots CanvasPattern.
 */
export function createDotsPattern(
  ctx: CanvasRenderingContext2D,
  dotRadius: number,
  spacing: number,
  color: string,
  density = 1
): CanvasPattern {
  const tileScale = 1 / density;
  const size = Math.max(8, Math.round((dotRadius * 2 + spacing) * tileScale));
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
 */
export function createStripesPattern(
  ctx: CanvasRenderingContext2D,
  stripeWidth: number,
  _gap: number,
  angle: number,
  color: string,
  density = 1
): CanvasPattern {
  const tileScale = 1 / density;
  const period = Math.max(4, Math.round(stripeWidth * 2 * tileScale));
  const size = period * 4;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pCtx = patternCanvas.getContext('2d')!;

  pCtx.fillStyle = '#FFFFFF';
  pCtx.fillRect(0, 0, size, size);

  pCtx.save();
  pCtx.translate(size / 2, size / 2);
  pCtx.rotate((angle * Math.PI) / 180);
  pCtx.translate(-size / 2, -size / 2);

  pCtx.fillStyle = color;
  for (let i = -size; i < size * 2; i += period) {
    pCtx.fillRect(i, -size, period / 2, size * 3);
  }

  pCtx.restore();

  return ctx.createPattern(patternCanvas, 'repeat')!;
}

/**
 * Create a stars CanvasPattern.
 */
export function createStarsPattern(
  ctx: CanvasRenderingContext2D,
  starSize: number,
  spacing: number,
  color: string,
  density = 1
): CanvasPattern {
  const tileScale = 1 / density;
  const size = Math.max(12, Math.round((starSize + spacing) * tileScale));
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pCtx = patternCanvas.getContext('2d')!;

  drawStar(pCtx, size / 2, size / 2, starSize / 2, starSize * 0.382 / 2, color);

  return ctx.createPattern(patternCanvas, 'repeat')!;
}

/**
 * Create a random letters CanvasPattern.
 */
export function createLettersPattern(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  spacing: number,
  color: string,
  density = 1
): CanvasPattern {
  const tileScale = 1 / density;
  const size = Math.max(12, Math.round((fontSize + spacing) * tileScale));
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pCtx = patternCanvas.getContext('2d')!;

  const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  pCtx.fillStyle = color;
  pCtx.font = `bold ${fontSize}px sans-serif`;
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  pCtx.fillText(letter, size / 2, size / 2);

  return ctx.createPattern(patternCanvas, 'repeat')!;
}

/**
 * Draw a 5-pointed star on a canvas context.
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 2) + (Math.PI * i / 5);
    const x = cx - r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

