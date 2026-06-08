import { useRef, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useBackgroundRemoval } from '../../hooks/useBackgroundRemoval';
import { BackgroundLayer } from './BackgroundLayer';
import { ElementsLayer } from './ElementsLayer';
import { StrokeLayer } from './StrokeLayer';
import { PortraitLayer } from './PortraitLayer';
import { Upload } from 'lucide-react';

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageDimensions = useEditorStore((s) => s.imageDimensions);
  const originalImage = useEditorStore((s) => s.originalImage);
  const setImage = useEditorStore((s) => s.setImage);
  const { remove } = useBackgroundRemoval();

  const aspectRatio = imageDimensions
    ? `${imageDimensions.width} / ${imageDimensions.height}`
    : '3 / 4';

  const handleFile = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        setImage(img, url);
        await remove(file);
      };
      img.src = url;
    },
    [setImage, remove],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    if (!originalImage) {
      inputRef.current?.click();
    }
  }, [originalImage]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="flex-1 flex items-center justify-center w-full pt-4 sm:pt-8 pb-6 sm:pb-10">
      <div
        ref={containerRef}
        id="canvasContainer"
        className={`relative w-full max-w-[520px] max-h-[calc(100vh-260px)] rounded-2xl overflow-hidden transition-all duration-500 ${
          originalImage
            ? 'shadow-[0_0_60px_rgba(255,255,255,0.04)] border border-[#1a1a1a]'
            : 'border-2 border-dashed border-[#333] cursor-pointer hover:border-[#555] animate-pulse-glow'
        }`}
        style={{ aspectRatio, touchAction: 'none' }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClick}
      >
        {originalImage ? (
          <>
            <BackgroundLayer />
            <ElementsLayer />
            <StrokeLayer />
            <PortraitLayer />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <Upload className="w-10 h-10 text-[#444]" />
            <p className="text-sm text-[#555] font-display tracking-wider">CLICK TO UPLOAD</p>
            <p className="text-[10px] text-[#333]">JPG / PNG / WebP</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
