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
 * Render random-color stroke: extract contour from dilated portrait,
 * compute normals, place elements along the ring centerline with random colors.
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

  // Build dilated portrait
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

  // Extract contour from dilated image
  const imageData = dCtx.getImageData(0, 0, W, H);
  const data = imageData.data;
  const step = Math.max(1, Math.floor(Math.min(W, H) / 400));
  const rawPoints: { x: number; y: number; nx: number; ny: number }[] = [];

  for (let y = step; y < H - step; y += step) {
    for (let x = step; x < W - step; x += step) {
      if (data[(y * W + x) * 4 + 3] < 128) continue;
      const l = data[(y * W + (x - step)) * 4 + 3];
      const r = data[(y * W + (x + step)) * 4 + 3];
      const u = data[((y - step) * W + x) * 4 + 3];
      const d = data[((y + step) * W + x) * 4 + 3];
      if (l < 128 || r < 128 || u < 128 || d < 128) {
        const dx = (r - l) / 255;
        const dy = (d - u) / 255;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        rawPoints.push({ x, y, nx: dx / len, ny: dy / len });
      }
    }
  }

  if (rawPoints.length === 0) return;

  // Element sizing: same as uniform mode
  const elemSize = Math.max(4, strokeType === 'dots'
    ? strokeWidth * 0.44
    : strokeType === 'letters'
    ? strokeWidth * 0.42
    : strokeWidth * 0.42);

  // Spacing: match uniform mode density (tile ≈ elemSize * 2)
  const spacing = elemSize * 2;

  // Sample evenly along contour with correct accumulation
  const sampled: typeof rawPoints = [];
  let acc = Infinity;

  for (let i = 0; i < rawPoints.length; i++) {
    if (sampled.length === 0) {
      sampled.push(rawPoints[i]);
      acc = 0;
      continue;
    }
    const prev = rawPoints[i - 1];
    const cur = rawPoints[i];
    acc += Math.sqrt((cur.x - prev.x) ** 2 + (cur.y - prev.y) ** 2);
    if (acc >= spacing) {
      sampled.push(cur);
      acc = 0;
    }
  }

  // Draw elements along the contour, offset inward to ring centerline
  const inset = half * 0.5;

  for (const pt of sampled) {
    // Offset toward portrait interior (opposite of outward normal)
    const ex = pt.x - pt.nx * inset;
    const ey = pt.y - pt.ny * inset;
    const color = randomHex();

    if (strokeType === 'dots') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ex, ey, elemSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (strokeType === 'stars') {
      drawStar(ctx, ex, ey, elemSize / 2, elemSize * 0.382 / 2, color);
    } else if (strokeType === 'letters') {
      const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      ctx.fillStyle = color;
      ctx.font = `bold ${elemSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, ex, ey);
    } else if (strokeType === 'stripes') {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = color;
      ctx.fillRect(-elemSize / 2, -elemSize / 4, elemSize, elemSize / 2);
      ctx.restore();
    }
  }
}
