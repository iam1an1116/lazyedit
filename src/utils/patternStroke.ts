/**
 * Create a retro polka dots CanvasPattern.
 */
export function createDotsPattern(
  ctx: CanvasRenderingContext2D,
  dotRadius: number,
  spacing: number,
  color: string
): CanvasPattern {
  const size = Math.max(8, Math.round(dotRadius * 2 + spacing));
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
  _angle: number,
  _color: string
): CanvasPattern {
  const period = Math.max(4, Math.round(stripeWidth * 2));
  const size = period * 4;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pCtx = patternCanvas.getContext('2d')!;

  pCtx.fillStyle = '#FFFFFF';
  pCtx.fillRect(0, 0, size, size);

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

/**
 * Create a stars CanvasPattern.
 */
export function createStarsPattern(
  ctx: CanvasRenderingContext2D,
  starSize: number,
  spacing: number,
  color: string
): CanvasPattern {
  const size = Math.max(12, Math.round(starSize + spacing));
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
  color: string
): CanvasPattern {
  const size = Math.max(12, Math.round(fontSize + spacing));
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

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Render random-color stroke: same ring region as uniform mode,
 * but fill with a grid of individually-colored elements via clipping.
 */
export function renderRandomStroke(
  canvas: HTMLCanvasElement,
  portraitImage: HTMLImageElement,
  strokeWidth: number,
  strokeType: 'dots' | 'stripes' | 'stars' | 'letters'
): void {
  const W = canvas.width;
  const H = canvas.height;
  if (W === 0 || H === 0) return;

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  const half = Math.ceil(strokeWidth / 2);

  // Build dilated portrait (same method as renderPatternStroke)
  const dilatedCanvas = document.createElement('canvas');
  dilatedCanvas.width = W;
  dilatedCanvas.height = H;
  const dCtx = dilatedCanvas.getContext('2d')!;

  for (let angle = 0; angle < 360; angle += 15) {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.round(Math.cos(rad) * half);
    const dy = Math.round(Math.sin(rad) * half);
    dCtx.drawImage(portraitImage, dx, dy, W, H);
  }

  // Build ring (dilated minus original)
  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = W;
  ringCanvas.height = H;
  const rCtx = ringCanvas.getContext('2d')!;
  rCtx.drawImage(dilatedCanvas, 0, 0);
  rCtx.globalCompositeOperation = 'destination-out';
  rCtx.drawImage(portraitImage, 0, 0, W, H);
  rCtx.globalCompositeOperation = 'source-over';

  // Draw ring onto main canvas to establish clip region
  ctx.drawImage(ringCanvas, 0, 0);

  // Clip to ring area, then fill with grid of random-colored elements
  ctx.save();
  ctx.clip();

  // Element sizing: fit inside ring width
  const elemSize = Math.max(4, strokeType === 'letters'
    ? Math.min(strokeWidth * 0.7, strokeWidth)
    : Math.min(strokeWidth * 0.5, strokeWidth));
  const spacing = elemSize * 2;

  // Draw grid of elements across canvas, clipped to ring
  for (let y = 0; y < H; y += spacing) {
    for (let x = 0; x < W; x += spacing) {
      const cx = x + spacing / 2;
      const cy = y + spacing / 2;
      const color = randomHex();

      if (strokeType === 'dots') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, elemSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (strokeType === 'stars') {
        drawStar(ctx, cx, cy, elemSize / 2, elemSize * 0.382 / 2, color);
      } else if (strokeType === 'letters') {
        const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        ctx.fillStyle = color;
        ctx.font = `bold ${elemSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, cx, cy);
      } else if (strokeType === 'stripes') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((45 * Math.PI) / 180);
        ctx.fillStyle = color;
        ctx.fillRect(-elemSize / 2, -elemSize / 4, elemSize, elemSize / 2);
        ctx.restore();
      }
    }
  }

  ctx.restore();
}
