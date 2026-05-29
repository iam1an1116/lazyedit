import type { CanvasElement, TextElement, ShapeElement, ShapeType } from '../types';
import { getPortraitBounds } from './portraitBounds';

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
