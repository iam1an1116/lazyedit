import type { StrokeStyle } from '../types';

export function randomSaturatedHex(): string {
  const h = Math.floor(Math.random() * 360);
  return hslToHex(h, 100, 50);
}

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

export interface RandomStrokeOptions {
  setStrokeStyle: (s: StrokeStyle) => void;
  setStrokeColor: (c: string) => void;
  setStrokeWidth: (w: number) => void;
  setStrokeElementScale: (v: number) => void;
  setStrokeDensity: (v: number) => void;
  setStrokeAngle: (v: number) => void;
  setStrokeOpacity: (v: number) => void;
  setStrokeRandomColor?: (v: boolean) => void;
  setStrokeLetter?: (v: string) => void;
}

export function applyRandomStroke(opts: RandomStrokeOptions): void {
  const styles: StrokeStyle[] = ['dots', 'stripes', 'stars', 'letters'];
  opts.setStrokeStyle(styles[Math.floor(Math.random() * styles.length)]);
  opts.setStrokeColor(randomSaturatedHex());
  opts.setStrokeWidth(8 + Math.floor(Math.random() * 33));
  opts.setStrokeElementScale(+(0.5 + Math.random() * 2).toFixed(1));
  opts.setStrokeDensity(+(0.5 + Math.random() * 2).toFixed(1));
  opts.setStrokeAngle(Math.floor(Math.random() * 180));
  opts.setStrokeOpacity(1);
  opts.setStrokeRandomColor?.(Math.random() > 0.5);
  opts.setStrokeLetter?.(Math.random() > 0.5
    ? 'random'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]);
}
