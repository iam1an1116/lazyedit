import type { CanvasElement, TextElement, ShapeElement, ShapeType } from '../types';
import { getPortraitBounds } from './portraitBounds';
import { extractContour } from './contour';

type RandomElementType = 'text' | 'rectangle' | 'circle' | 'triangle' | 'star';

let nextId = 1;
function genId() {
  return `el-${nextId++}-${Date.now()}`;
}

const ALL_FONTS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Space Mono', value: 'Space Mono, monospace' },
  { label: 'Helvetica', value: 'Helvetica Neue, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Lobster', value: 'Lobster, cursive' },
  { label: 'Permanent Marker', value: 'Permanent Marker, cursive' },
  { label: 'Press Start 2P', value: 'Press Start 2P, cursive' },
];

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function randomSaturatedHex(): string {
  const h = Math.floor(Math.random() * 360);
  return hslToHex(h, 100, 50);
}

function randomLetters(): string {
  const len = 2 + Math.floor(Math.random() * 5);
  return Array.from({ length: len }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  ).join('');
}

export interface RandomFillOptions {
  count?: number;
  sizeMultiplier?: number; // 1 = auto
  opacity?: number; // 0 = auto
  enabledTypes?: RandomElementType[];
  imageDimensions: { width: number; height: number } | null;
  portraitUrl: string | null;
  addElement: (el: CanvasElement) => void;
  resetElements: () => void;
}

export async function generateRandomFill(opts: RandomFillOptions): Promise<void> {
  const {
    count = 5,
    sizeMultiplier = 1,
    opacity: manualOpacity = 0,
    enabledTypes = ['text', 'rectangle', 'circle', 'triangle', 'star'],
    imageDimensions,
    portraitUrl,
    addElement,
    resetElements,
  } = opts;

  resetElements();

  const container = document.getElementById('canvasContainer');
  const cw = container?.clientWidth || 320;
  const ch = container?.clientHeight || 427;

  const refSize = imageDimensions
    ? Math.min(imageDimensions.width, imageDimensions.height) / 12
    : 60;
  const effectiveCount = Math.min(count, 30);
  const autoSize = refSize / (1 + effectiveCount * 0.255);
  const baseSize = Math.max(12, autoSize * sizeMultiplier);

  const enabledShapes = enabledTypes.filter((t) => t !== 'text') as ShapeType[];
  const hasText = enabledTypes.includes('text');

  let px: number, py: number, pw: number, ph: number;

  if (portraitUrl) {
    const bounds = await getPortraitBounds(portraitUrl, cw, ch);
    if (bounds) {
      px = bounds.x;
      py = bounds.y;
      pw = bounds.width;
      ph = bounds.height;
    } else {
      const m = 0.2;
      px = cw * m; py = ch * m;
      pw = cw * (1 - 2 * m); ph = ch * (1 - 2 * m);
    }
  } else {
    const m = 0.2;
    px = cw * m; py = ch * m;
    pw = cw * (1 - 2 * m); ph = ch * (1 - 2 * m);
  }

  const innerPad = 0.15;
  const ix = px + pw * innerPad;
  const iy = py + ph * innerPad;
  const iw = pw * (1 - 2 * innerPad);
  const ih = ph * (1 - 2 * innerPad);

  const portraitRatio = count < 20 ? 0.3 : count < 50 ? 0.1 : 0.05;
  const portraitCount = Math.max(1, Math.round(count * portraitRatio));
  const outerCount = count - portraitCount;

  const isPortraitArr = Array(portraitCount).fill(true).concat(Array(outerCount).fill(false));
  for (let i = isPortraitArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [isPortraitArr[i], isPortraitArr[j]] = [isPortraitArr[j], isPortraitArr[i]];
  }

  const cols = Math.ceil(Math.sqrt(count * (cw / ch)));
  const rows = Math.ceil(count / cols);
  const cellW = cw / cols;
  const cellH = ch / rows;

  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  for (let i = 0; i < count; i++) {
    const isPortrait = isPortraitArr[i];
    const cellIdx = cells[i];
    const col = cellIdx % cols;
    const row = Math.floor(cellIdx / cols);

    const szMult = 0.4 + Math.random() * 0.9;
    const size = Math.round(baseSize * szMult);

    let cx: number, cy: number, rotation: number;

    if (isPortrait) {
      cx = ix + Math.random() * Math.max(0, iw - size);
      cy = iy + Math.random() * Math.max(0, ih - size);
      rotation = Math.round((Math.random() - 0.5) * 60);
    } else {
      const baseX = col * cellW + cellW / 2 - size / 2;
      const baseY = row * cellH + cellH / 2 - size / 2;
      const jitterX = (Math.random() - 0.5) * cellW * 0.4;
      const jitterY = (Math.random() - 0.5) * cellH * 0.4;
      cx = baseX + jitterX;
      cy = baseY + jitterY;

      const elCenterX = cx + size / 2;
      const elCenterY = cy + size / 2;
      if (elCenterX > px && elCenterX < px + pw && elCenterY > py && elCenterY < py + ph) {
        const distLeft = elCenterX - px;
        const distRight = px + pw - elCenterX;
        const distTop = elCenterY - py;
        const distBottom = py + ph - elCenterY;
        const minDist = Math.min(distLeft, distRight, distTop, distBottom);
        const push = Math.max(size * 0.5, 10);
        if (minDist === distLeft) cx = px - size - push * Math.random();
        else if (minDist === distRight) cx = px + pw + push * Math.random();
        else if (minDist === distTop) cy = py - size - push * Math.random();
        else cy = py + ph + push * Math.random();
      }
      rotation = 0;
    }

    cx = Math.max(0, Math.min(cw - size, cx));
    cy = Math.max(0, Math.min(ch - size, cy));

    let isText = false;
    if (hasText && enabledShapes.length > 0) {
      isText = Math.random() > 0.5;
    } else if (hasText) {
      isText = true;
    }

    if (isText) {
      const font = ALL_FONTS[Math.floor(Math.random() * ALL_FONTS.length)];
      let elOpacity: number;
      if (manualOpacity > 0) {
        elOpacity = Math.min(1, Math.max(0.05, manualOpacity + (Math.random() - 0.5) * 0.2));
      } else {
        const baseOpacity = 0.55 + Math.random() * 0.4;
        elOpacity = Math.min(1, baseOpacity * 1.45);
      }
      const el: TextElement = {
        type: 'text',
        id: genId(),
        x: Math.round(cx),
        y: Math.round(cy),
        width: size * 2,
        height: size,
        content: randomLetters(),
        fontSize: Math.round(size * 0.6),
        fontFamily: font.value,
        color: randomSaturatedHex(),
        opacity: elOpacity,
        strokeColor: '#000000',
        strokeWidth: 0,
        rotation,
        bold: Math.random() > 0.5,
        italic: Math.random() > 0.7,
      };
      addElement(el);
    } else {
      let elOpacity: number;
      if (manualOpacity > 0) {
        elOpacity = Math.min(1, Math.max(0.05, manualOpacity + (Math.random() - 0.5) * 0.2));
      } else {
        const sizeRatio = size / (baseSize * 1.3);
        const baseOpacity = sizeRatio > 0.3 ? 0.3 + Math.random() * 0.4 : 1;
        elOpacity = Math.min(1, baseOpacity * 1.35);
      }

      const st = enabledShapes[Math.floor(Math.random() * enabledShapes.length)];
      const el: ShapeElement = {
        type: 'shape',
        shapeType: st,
        id: genId(),
        x: Math.round(cx),
        y: Math.round(cy),
        width: size,
        height: size,
        color: randomSaturatedHex(),
        borderRadius: st === 'circle' ? 50 : 0,
        opacity: elOpacity,
        rotation,
      };
      addElement(el);
    }
  }
}

function randomWord(): string {
  const len = 6 + Math.floor(Math.random() * 10);
  return Array.from({ length: len }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  ).join('');
}

export async function generateRandomWords(opts: {
  portraitUrl: string;
  addElement: (el: CanvasElement) => void;
}): Promise<void> {
  const { portraitUrl, addElement } = opts;

  const container = document.getElementById('canvasContainer');
  const cw = container?.clientWidth || 320;
  const ch = container?.clientHeight || 427;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = portraitUrl;
  });

  const bounds = await getPortraitBounds(portraitUrl, cw, ch);
  if (!bounds) return;

  // Extract edge points from portrait
  const edgePoints = extractContour(img);
  if (edgePoints.length < 10) return;

  // Map image coords to container coords (object-fit: cover)
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const containerAspect = cw / ch;
  const imgAspect = imgW / imgH;

  let visX: number, visY: number, visW: number, visH: number;
  if (imgAspect > containerAspect) {
    visH = 1; visW = containerAspect / imgAspect;
    visX = (1 - visW) / 2; visY = 0;
  } else {
    visW = 1; visH = imgAspect / containerAspect;
    visX = 0; visY = (1 - visH) / 2;
  }

  const mapped = edgePoints.map(p => ({
    x: (visX + (p.x / imgW) * visW) * cw,
    y: (visY + (p.y / imgH) * visH) * ch,
  }));

  // Filter to portrait bounds
  const inside = mapped.filter(
    p => p.x >= bounds.x && p.x <= bounds.x + bounds.width &&
         p.y >= bounds.y && p.y <= bounds.y + bounds.height
  );
  if (inside.length < 10) return;

  // Grid-based sampling for even distribution
  const count = Math.max(3, Math.min(12, Math.round(inside.length / 80)));
  const gridCols = Math.ceil(Math.sqrt(count * (bounds.width / bounds.height)));
  const gridRows = Math.ceil(count / gridCols);
  const cellW = bounds.width / gridCols;
  const cellH = bounds.height / gridRows;

  const cells = Array.from({ length: gridCols * gridRows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const baseFontSize = Math.max(14, Math.round(Math.min(bounds.width, bounds.height) * 0.06));

  // Pre-compute alpha data for edge direction detection
  const scanW = 200;
  const scanH = Math.round(200 * (imgH / imgW));
  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = scanW;
  alphaCanvas.height = scanH;
  const alphaCtx = alphaCanvas.getContext('2d')!;
  alphaCtx.drawImage(img, 0, 0, scanW, scanH);
  const alphaData = alphaCtx.getImageData(0, 0, scanW, scanH).data;

  for (let i = 0; i < Math.min(count, cells.length); i++) {
    const cellIdx = cells[i];
    const col = cellIdx % gridCols;
    const row = Math.floor(cellIdx / gridCols);

    const cellX = bounds.x + col * cellW;
    const cellY = bounds.y + row * cellH;

    // Find edge points in this cell
    const cellPoints = inside.filter(
      p => p.x >= cellX && p.x < cellX + cellW &&
           p.y >= cellY && p.y < cellY + cellH
    );
    if (cellPoints.length === 0) continue;

    const pt = cellPoints[Math.floor(Math.random() * cellPoints.length)];

    // Determine edge direction by checking alpha neighbors
    const checkX = Math.round(((pt.x / cw) - visX) / visW * scanW);
    const checkY = Math.round(((pt.y / ch) - visY) / visH * scanH);

    let dx = 0, dy = 0;
    for (let oy = -3; oy <= 3; oy++) {
      for (let ox = -3; ox <= 3; ox++) {
        const nx = checkX + ox;
        const ny = checkY + oy;
        if (nx >= 0 && nx < scanW && ny >= 0 && ny < scanH) {
          const alpha = alphaData[(ny * scanW + nx) * 4 + 3];
          if (alpha < 30) {
            dx += ox;
            dy += oy;
          }
        }
      }
    }
    // Outward direction (toward transparent)
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const outX = dx / len;
    const outY = dy / len;

    // Tangent direction (perpendicular to normal) = edge direction
    const tanX = outY;
    const tanY = -outX;
    let angle = Math.atan2(tanY, tanX) * 180 / Math.PI;
    // Normalize to [-90, 90] for readability (keep text left-to-right)
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    const rotation = Math.round(angle + (Math.random() - 0.5) * 10);

    const fontSize = baseFontSize + Math.round((Math.random() - 0.5) * baseFontSize * 0.4);
    const wordW = fontSize * 8;
    const wordH = fontSize * 1.2;

    // Position: offset inward by 0.5-1.5x fontSize (scales with word, not portrait)
    const offsetDist = fontSize * (0.5 + Math.random());

    // Offset the word so it overlaps the portrait edge
    let wx = pt.x - outX * offsetDist;
    let wy = pt.y - outY * offsetDist;

    // Center the word on the position
    wx -= wordW / 2;
    wy -= wordH / 2;

    // Clamp to canvas
    wx = Math.max(0, Math.min(cw - wordW, wx));
    wy = Math.max(0, Math.min(ch - wordH, wy));

    addElement({
      type: 'text',
      id: genId(),
      x: Math.round(wx),
      y: Math.round(wy),
      width: wordW,
      height: wordH,
      content: randomWord(),
      fontSize,
      fontFamily: ALL_FONTS[Math.floor(Math.random() * ALL_FONTS.length)].value,
      color: randomSaturatedHex(),
      opacity: 0.85 + Math.random() * 0.15,
      strokeColor: '#000000',
      strokeWidth: 0,
      rotation,
      bold: true,
      italic: false,
    });
  }
}
