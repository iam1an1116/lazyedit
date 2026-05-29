import { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { renderElementStroke } from '../../utils/contour';

const PATTERN_STYLES = ['dots', 'stripes', 'stars', 'letters'] as const;

export function StrokeLayer() {
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const strokeStyle = useEditorStore((s) => s.strokeStyle);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const strokeColor = useEditorStore((s) => s.strokeColor);
  const strokeElementScale = useEditorStore((s) => s.strokeElementScale);
  const strokeDensity = useEditorStore((s) => s.strokeDensity);
  const strokeAngle = useEditorStore((s) => s.strokeAngle);
  const strokeOpacity = useEditorStore((s) => s.strokeOpacity);
  const strokeRandomColor = useEditorStore((s) => s.strokeRandomColor);
  const strokeLetter = useEditorStore((s) => s.strokeLetter);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDims({ w: width, h: height });
        }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const isPattern = PATTERN_STYLES.includes(strokeStyle as typeof PATTERN_STYLES[number]);
    if (!isPattern) return;
    if (!portraitUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const containerEl = containerRef.current;
    const cw = dims.w || containerEl?.clientWidth || 0;
    const ch = dims.h || containerEl?.clientHeight || 0;
    if (cw === 0 || ch === 0) return;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;

      canvas.width = cw;
      canvas.height = ch;

      renderElementStroke({
        canvas,
        portraitImage: img,
        strokeWidth,
        strokeColor,
        strokeOpacity,
        elementSize: strokeElementScale,
        density: strokeDensity,
        strokeStyle: strokeStyle as 'dots' | 'stripes' | 'stars' | 'letters',
        strokeAngle,
        randomColor: strokeRandomColor,
        letter: strokeLetter,
      });
    };
    img.src = portraitUrl;

    return () => { cancelled = true; };
  }, [portraitUrl, strokeStyle, strokeWidth, strokeColor, strokeElementScale, strokeDensity, strokeAngle, strokeOpacity, strokeRandomColor, strokeLetter, dims.w, dims.h]);

  useEffect(() => {
    const isPattern = PATTERN_STYLES.includes(strokeStyle as typeof PATTERN_STYLES[number]);
    if (!isPattern) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [strokeStyle]);

  const isPattern = PATTERN_STYLES.includes(strokeStyle as typeof PATTERN_STYLES[number]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[25] pointer-events-none overflow-hidden rounded-2xl"
      style={{ display: isPattern && portraitUrl ? 'block' : 'none' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
