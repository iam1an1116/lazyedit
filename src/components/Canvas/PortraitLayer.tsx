import { useRef, useEffect, useState, useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { renderPatternStroke } from '../../utils/contour';
import {
  createDotsPattern,
  createStripesPattern,
  createStarsPattern,
  createLettersPattern,
} from '../../utils/patternStroke';
import { getFilterCSS } from '../../utils/filters';

const PATTERN_STYLES = ['dots', 'stripes', 'stars', 'letters'] as const;

export function PortraitLayer() {
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const portraitFilter = useEditorStore((s) => s.portraitFilter);
  const strokeStyle = useEditorStore((s) => s.strokeStyle);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const strokeColor = useEditorStore((s) => s.strokeColor);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokeCanvasRef = useRef<HTMLCanvasElement>(null);
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

  const svgFilterId = useMemo(
    () => `stroke-${strokeWidth}-${strokeColor.replace('#', '')}`,
    [strokeWidth, strokeColor]
  );

  // Canvas-based stroke rendering
  useEffect(() => {
    const isPattern = PATTERN_STYLES.includes(strokeStyle as typeof PATTERN_STYLES[number]);
    if (!isPattern) return;
    if (!portraitUrl) return;

    const canvas = strokeCanvasRef.current;
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

      const ctx = canvas.getContext('2d')!;
      let style: CanvasRenderingContext2D['strokeStyle'];

      if (strokeStyle === 'dots') {
        const r = Math.max(2, strokeWidth * 0.22);
        style = createDotsPattern(ctx, r, r * 1.6, strokeColor);
      } else if (strokeStyle === 'stripes') {
        style = createStripesPattern(ctx, strokeWidth, 0, 45, strokeColor);
      } else if (strokeStyle === 'stars') {
        const sz = Math.max(5, strokeWidth * 0.42);
        style = createStarsPattern(ctx, sz, sz * 1.1, strokeColor);
      } else {
        const sz = Math.max(5, strokeWidth * 0.42);
        style = createLettersPattern(ctx, sz, sz * 1.1, strokeColor);
      }

      renderPatternStroke(canvas, img, strokeWidth, style);
    };
    img.src = portraitUrl;

    return () => { cancelled = true; };
  }, [portraitUrl, strokeStyle, strokeWidth, strokeColor, dims.w, dims.h]);

  // Clear canvas when stroke style changes away from pattern
  useEffect(() => {
    const isPattern = PATTERN_STYLES.includes(strokeStyle as typeof PATTERN_STYLES[number]);
    if (!isPattern) {
      const canvas = strokeCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [strokeStyle]);

  if (!portraitUrl) {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
        <span className="absolute top-12 left-4 text-[10px] uppercase tracking-widest text-black/30 font-mono">
          z-30 / subject
        </span>
      </div>
    );
  }

  const filterCSS = portraitFilter === 'glitch' ? 'none' : getFilterCSS(portraitFilter);

  return (
    <div ref={containerRef} className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
      {strokeStyle === 'solid' && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id={svgFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius={strokeWidth / 2}
                result="dilated"
              />
              <feFlood floodColor={strokeColor} result="fillColor" />
              <feComposite in="fillColor" in2="dilated" operator="in" result="stroke" />
              <feMerge>
                <feMergeNode in="stroke" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      )}

      <img
        src={portraitUrl}
        alt="Portrait"
        className="w-full h-full object-cover"
        style={{
          filter: strokeStyle === 'solid'
            ? `${filterCSS !== 'none' ? filterCSS + ' ' : ''}url(#${svgFilterId})`
            : filterCSS,
        }}
        draggable={false}
      />

      {portraitFilter === 'glitch' && (
        <>
          <img
            src={portraitUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60"
            style={{ transform: 'translate(-3px, 0)', filter: 'hue-rotate(90deg)' }}
            draggable={false}
          />
          <img
            src={portraitUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-60"
            style={{ transform: 'translate(3px, 0)', filter: 'hue-rotate(-90deg)' }}
            draggable={false}
          />
        </>
      )}

      <canvas
        ref={strokeCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: 'none',
          display: PATTERN_STYLES.includes(strokeStyle as typeof PATTERN_STYLES[number]) ? 'block' : 'none',
        }}
      />
    </div>
  );
}
