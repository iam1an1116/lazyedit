import { useRef, useEffect, useState, useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { renderPatternStroke } from '../../utils/contour';
import { createDotsPattern, createStripesPattern } from '../../utils/patternStroke';
import { getFilterCSS } from '../../utils/filters';

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

  // SVG filter ID for solid stroke
  const svgFilterId = useMemo(
    () => `stroke-${strokeWidth}-${strokeColor.replace('#', '')}`,
    [strokeWidth, strokeColor]
  );

  // Canvas-based pattern stroke rendering (dots / stripes)
  useEffect(() => {
    if (strokeStyle !== 'dots' && strokeStyle !== 'stripes') return;
    if (!portraitUrl) return;

    const canvas = strokeCanvasRef.current;
    if (!canvas) return;

    // Use ResizeObserver dims, fallback to container client size
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
        style = createDotsPattern(ctx, strokeWidth * 0.8, strokeWidth * 2.5, strokeColor);
      } else {
        style = createStripesPattern(ctx, strokeWidth, 0, 45, strokeColor);
      }

      renderPatternStroke(canvas, img, strokeWidth, style);
    };
    img.src = portraitUrl;

    return () => { cancelled = true; };
  }, [portraitUrl, strokeStyle, strokeWidth, strokeColor, dims.w, dims.h]);

  // Clear canvas when stroke style changes away from pattern
  useEffect(() => {
    if (strokeStyle !== 'dots' && strokeStyle !== 'stripes') {
      const canvas = strokeCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [strokeStyle]);

  if (!portraitUrl) {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none">
        <span className="absolute top-12 left-4 text-[10px] uppercase tracking-widest text-black/30 font-mono">
          z-30 / subject
        </span>
      </div>
    );
  }

  const filterCSS = portraitFilter === 'glitch' ? 'none' : getFilterCSS(portraitFilter);

  return (
    <div ref={containerRef} className="absolute inset-0 z-30 pointer-events-none">
      {/* SVG filter definition for solid stroke */}
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

      {/* Portrait image */}
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

      {/* Glitch effect overlay */}
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

      {/* Pattern stroke canvas (dots / stripes) */}
      <canvas
        ref={strokeCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: 'none',
          display: strokeStyle === 'dots' || strokeStyle === 'stripes' ? 'block' : 'none',
        }}
      />
    </div>
  );
}
