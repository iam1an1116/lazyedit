import type { CanvasElement, PortraitFilter, StrokeStyle } from '../types';
import { getFilterCSS, applyGlitchEffect } from './filters';
import { renderPatternStroke } from './contour';
import {
  createDotsPattern,
  createStripesPattern,
  createStarsPattern,
  createLettersPattern,
  renderRandomStroke,
} from './patternStroke';

interface ExportOptions {
  originalImage: HTMLImageElement;
  portraitUrl: string | null;
  elements: CanvasElement[];
  previewWidth: number;
  previewHeight: number;
  strokeStyle: StrokeStyle;
  strokeWidth: number;
  strokeColor: string;
  strokeRandomColor: boolean;
  portraitFilter: PortraitFilter;
}

/**
 * Composite all layers into a single canvas at original resolution and trigger download.
 */
export async function exportAsPNG(options: ExportOptions): Promise<void> {
  const {
    originalImage,
    portraitUrl,
    elements,
    previewWidth,
    previewHeight,
    strokeStyle,
    strokeWidth,
    strokeColor,
    strokeRandomColor,
    portraitFilter,
  } = options;

  const origW = originalImage.naturalWidth;
  const origH = originalImage.naturalHeight;
  const scaleX = origW / previewWidth;
  const scaleY = origH / previewHeight;

  const canvas = document.createElement('canvas');
  canvas.width = origW;
  canvas.height = origH;
  const ctx = canvas.getContext('2d')!;

  // Layer 1: Background
  ctx.drawImage(originalImage, 0, 0, origW, origH);

  // Layer 2: Elements
  for (const el of elements) {
    ctx.save();
    const x = el.x * scaleX;
    const y = el.y * scaleY;
    const w = el.width * scaleX;
    const h = el.height * scaleY;

    if (el.rotation) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    if (el.type === 'shape') {
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.color;
      if (el.shapeType === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();
      } else if (el.shapeType === 'circle') {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (el.shapeType === 'star') {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const outerR = Math.min(w, h) / 2;
        const innerR = outerR * 0.382;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 2) + (Math.PI * i / 5);
          const px = cx - r * Math.cos(angle);
          const py = cy - r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        const r = el.borderRadius * Math.min(scaleX, scaleY);
        drawRoundedRect(ctx, x, y, w, h, r);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (el.type === 'text') {
      const fs = el.fontSize * Math.min(scaleX, scaleY);
      const font = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${fs}px ${el.fontFamily}`;
      ctx.font = font;
      ctx.textBaseline = 'top';
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.color;
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth * Math.min(scaleX, scaleY);
      if (el.strokeWidth > 0) {
        ctx.strokeText(el.content, x, y);
      }
      ctx.fillText(el.content, x, y);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // Layer 3: Portrait
  if (portraitUrl) {
    const portraitImg = await loadImage(portraitUrl);

    if (portraitFilter === 'glitch') {
      applyGlitchEffect(ctx, portraitImg, origW, origH, 8 * scaleX);
    } else {
      if (portraitFilter !== 'normal') {
        ctx.filter = getFilterCSS(portraitFilter);
      }
      ctx.drawImage(portraitImg, 0, 0, origW, origH);
      ctx.filter = 'none';
    }

    // Contour stroke
    if (strokeStyle !== 'none') {
      const strokeCanvas = document.createElement('canvas');
      strokeCanvas.width = origW;
      strokeCanvas.height = origH;
      const sCtx = strokeCanvas.getContext('2d')!;

      const sw = strokeWidth * Math.min(scaleX, scaleY);

      if (strokeStyle === 'solid') {
        renderPatternStroke(strokeCanvas, portraitImg, sw, strokeColor);
      } else if (strokeRandomColor) {
        renderRandomStroke(strokeCanvas, portraitImg, sw, strokeStyle as 'dots' | 'stripes' | 'stars' | 'letters');
      } else {
        let strokeStyleValue: CanvasRenderingContext2D['strokeStyle'];

        if (strokeStyle === 'dots') {
          const r = Math.max(2, sw * 0.22);
          strokeStyleValue = createDotsPattern(sCtx, r, r * 1.6, strokeColor);
        } else if (strokeStyle === 'stripes') {
          strokeStyleValue = createStripesPattern(sCtx, sw, 0, 45, strokeColor);
        } else if (strokeStyle === 'stars') {
          const sz = Math.max(5, sw * 0.42);
          strokeStyleValue = createStarsPattern(sCtx, sz, sz * 1.1, strokeColor);
        } else {
          const sz = Math.max(5, sw * 0.42);
          strokeStyleValue = createLettersPattern(sCtx, sz, sz * 1.1, strokeColor);
        }

        renderPatternStroke(strokeCanvas, portraitImg, sw, strokeStyleValue);
      }

      ctx.drawImage(strokeCanvas, 0, 0);
    }
  }

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lazyedit-poster.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
