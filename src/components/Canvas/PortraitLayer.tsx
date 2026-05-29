import { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { getFilterCSS } from '../../utils/filters';

export function PortraitLayer() {
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const portraitFilter = useEditorStore((s) => s.portraitFilter);
  const strokeStyle = useEditorStore((s) => s.strokeStyle);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const strokeColor = useEditorStore((s) => s.strokeColor);

  const svgFilterId = useMemo(
    () => `stroke-${strokeWidth}-${strokeColor.replace('#', '')}`,
    [strokeWidth, strokeColor]
  );

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
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
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
    </div>
  );
}
