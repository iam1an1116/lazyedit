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
 * Render random-color stroke by drawing individual elements along the contour.
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

  // Extract contour points
  const imgW = portraitImage.naturalWidth;
  const imgH = portraitImage.naturalHeight;
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = imgW;
  tmpCanvas.height = imgH;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.drawImage(portraitImage, 0, 0);
  const imageData = tmpCtx.getImageData(0, 0, imgW, imgH);
  const data = imageData.data;

  // Find boundary points
  const step = Math.max(1, Math.floor(Math.min(imgW, imgH) / 400));
  const contourPoints: { x: number; y: number }[] = [];

  for (let y = step; y < imgH - step; y += step) {
    for (let x = step; x < imgW - step; x += step) {
      const alpha = data[(y * imgW + x) * 4 + 3];
      if (alpha < 30) continue;
      const left = data[(y * imgW + (x - step)) * 4 + 3];
      const right = data[(y * imgW + (x + step)) * 4 + 3];
      const up = data[((y - step) * imgW + x) * 4 + 3];
      const down = data[((y + step) * imgW + x) * 4 + 3];
      if (left < 30 || right < 30 || up < 30 || down < 30) {
        contourPoints.push({
          x: (x / imgW) * W,
          y: (y / imgH) * H,
        });
      }
    }
  }

  if (contourPoints.length === 0) return;

  // Element sizing: must fit inside the ring (ring width ≈ strokeWidth)
  // Keep element ≤ 55% of ring width so it doesn't clip at edges
  const maxElem = strokeWidth * 0.55;
  const elemSize = Math.max(4, strokeType === 'letters'
    ? Math.min(maxElem, strokeWidth * 0.7)
    : Math.min(maxElem, strokeWidth * 0.5));

  // Spacing: tighter for denser stroke feel
  const spacing = elemSize * 2.2;

  // Sample points with correct accumulation
  const sampled: typeof contourPoints = [];
  let accumulated = Infinity; // force first point

  for (let i = 0; i < contourPoints.length; i++) {
    if (sampled.length === 0) {
      sampled.push(contourPoints[i]);
      accumulated = 0;
      continue;
    }
    const prev = contourPoints[i - 1];
    const cur = contourPoints[i];
    accumulated += Math.sqrt((cur.x - prev.x) ** 2 + (cur.y - prev.y) ** 2);
    if (accumulated >= spacing) {
      sampled.push(cur);
      accumulated = 0;
    }
  }

  // Draw elements
  for (const pt of sampled) {
    const color = randomHex();

    if (strokeType === 'dots') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, elemSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (strokeType === 'stars') {
      drawStar(ctx, pt.x, pt.y, elemSize / 2, elemSize * 0.382 / 2, color);
    } else if (strokeType === 'letters') {
      const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      ctx.fillStyle = color;
      ctx.font = `bold ${elemSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, pt.x, pt.y);
    } else if (strokeType === 'stripes') {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = color;
      ctx.fillRect(-elemSize / 2, -elemSize / 4, elemSize, elemSize / 2);
      ctx.restore();
    }
  }
}
