import type { StrokeStyle } from '../types';

export function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

export interface RandomStrokeOptions {
  setStrokeStyle: (s: StrokeStyle) => void;
  setStrokeColor: (c: string) => void;
  setStrokeWidth: (w: number) => void;
  setStrokeElementScale: (v: number) => void;
  setStrokeDensity: (v: number) => void;
  setStrokeAngle: (v: number) => void;
  setStrokeOpacity: (v: number) => void;
}

export function applyRandomStroke(opts: RandomStrokeOptions): void {
  const styles: StrokeStyle[] = ['dots', 'stripes', 'stars', 'letters'];
  opts.setStrokeStyle(styles[Math.floor(Math.random() * styles.length)]);
  opts.setStrokeColor(randomHex());
  opts.setStrokeWidth(8 + Math.floor(Math.random() * 33));
  opts.setStrokeElementScale(+(0.5 + Math.random() * 2).toFixed(1));
  opts.setStrokeDensity(+(0.5 + Math.random() * 2).toFixed(1));
  opts.setStrokeAngle(Math.floor(Math.random() * 180));
  opts.setStrokeOpacity(+(0.5 + Math.random() * 0.5).toFixed(2));
}
