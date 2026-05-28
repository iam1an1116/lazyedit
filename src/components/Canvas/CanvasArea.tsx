import { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BackgroundLayer } from './BackgroundLayer';
import { ElementsLayer } from './ElementsLayer';
import { PortraitLayer } from './PortraitLayer';

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageDimensions = useEditorStore((s) => s.imageDimensions);

  // Dynamic aspect ratio from the uploaded image, fallback to 3:4
  const aspectRatio = imageDimensions
    ? `${imageDimensions.width} / ${imageDimensions.height}`
    : '3 / 4';

  return (
    <div className="flex-1 flex items-center justify-center bg-white rounded-3xl border border-canvas-border shadow-sm p-8 min-h-[500px] lg:min-h-0 relative overflow-hidden">
      <div
        ref={containerRef}
        id="canvasContainer"
        className="relative w-full max-w-[420px] max-h-[calc(100vh-200px)] bg-canvas-border rounded-2xl shadow-xl overflow-hidden border border-[#D4D4D0]"
        style={{ aspectRatio }}
      >
        <BackgroundLayer />
        <ElementsLayer />
        <PortraitLayer />
      </div>
    </div>
  );
}
