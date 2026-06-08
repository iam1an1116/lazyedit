import { useRef, useCallback, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useBackgroundRemoval } from '../../hooks/useBackgroundRemoval';
import { BackgroundLayer } from './BackgroundLayer';
import { ElementsLayer } from './ElementsLayer';
import { StrokeLayer } from './StrokeLayer';
import { PortraitLayer } from './PortraitLayer';
import { Camera } from './Camera';
import { Upload, Camera as CameraIcon } from 'lucide-react';

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageDimensions = useEditorStore((s) => s.imageDimensions);
  const originalImage = useEditorStore((s) => s.originalImage);
  const setImage = useEditorStore((s) => s.setImage);
  const { remove } = useBackgroundRemoval();
  const [showCamera, setShowCamera] = useState(false);

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

  const handleUploadClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  }, []);

  const handleCameraClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCamera(true);
  }, []);

  const handleCameraCapture = useCallback((file: File) => {
    setShowCamera(false);
    handleFile(file);
  }, [handleFile]);

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
            : 'border-2 border-dashed border-[#333] hover:border-[#555] animate-pulse-glow'
        }`}
        style={{ aspectRatio, touchAction: 'none' }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {originalImage ? (
          <>
            <BackgroundLayer />
            <ElementsLayer />
            <StrokeLayer />
            <PortraitLayer />
          </>
        ) : showCamera ? (
          <Camera onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center gap-6">
              <button
                onClick={handleUploadClick}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-full border border-[#333] flex items-center justify-center group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/5 transition-all">
                  <Upload className="w-5 h-5 text-[#555] group-hover:text-neon-cyan transition-colors" />
                </div>
                <span className="text-[10px] text-[#555] font-display tracking-wider group-hover:text-neon-cyan transition-colors">上传图片</span>
              </button>

              <div className="w-px h-10 bg-[#222]" />

              <button
                onClick={handleCameraClick}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-full border border-[#333] flex items-center justify-center group-hover:border-neon-magenta/50 group-hover:bg-neon-magenta/5 transition-all">
                  <CameraIcon className="w-5 h-5 text-[#555] group-hover:text-neon-magenta transition-colors" />
                </div>
                <span className="text-[10px] text-[#555] font-display tracking-wider group-hover:text-neon-magenta transition-colors">拍照</span>
              </button>
            </div>

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
