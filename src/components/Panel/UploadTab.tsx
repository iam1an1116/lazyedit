import { useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, X, RotateCcw, Zap } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useBackgroundRemoval } from '../../hooks/useBackgroundRemoval';
import { generateRandomFill } from '../../utils/randomFill';
import { applyRandomStroke } from '../../utils/randomStroke';

export function UploadTab() {
  const originalImage = useEditorStore((s) => s.originalImage);
  const originalImageUrl = useEditorStore((s) => s.originalImageUrl);
  const isRemoving = useEditorStore((s) => s.isRemoving);
  const removeProgress = useEditorStore((s) => s.removeProgress);
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const setImage = useEditorStore((s) => s.setImage);
  const clearImage = useEditorStore((s) => s.clearImage);
  const resetEdits = useEditorStore((s) => s.resetEdits);
  const addElement = useEditorStore((s) => s.addElement);
  const resetElements = useEditorStore((s) => s.resetElements);
  const imageDimensions = useEditorStore((s) => s.imageDimensions);
  const setStrokeStyle = useEditorStore((s) => s.setStrokeStyle);
  const setStrokeColor = useEditorStore((s) => s.setStrokeColor);
  const setStrokeWidth = useEditorStore((s) => s.setStrokeWidth);
  const setStrokeElementScale = useEditorStore((s) => s.setStrokeElementScale);
  const setStrokeDensity = useEditorStore((s) => s.setStrokeDensity);
  const setStrokeAngle = useEditorStore((s) => s.setStrokeAngle);
  const setStrokeOpacity = useEditorStore((s) => s.setStrokeOpacity);
  const setStrokeRandomColor = useEditorStore((s) => s.setStrokeRandomColor);
  const setStrokeLetter = useEditorStore((s) => s.setStrokeLetter);
  const { remove } = useBackgroundRemoval();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLazy = useCallback(async () => {
    applyRandomStroke({
      setStrokeStyle, setStrokeColor, setStrokeWidth,
      setStrokeElementScale, setStrokeDensity, setStrokeAngle, setStrokeOpacity,
      setStrokeRandomColor, setStrokeLetter,
    });
    await generateRandomFill({
      imageDimensions,
      portraitUrl,
      addElement,
      resetElements,
    });
  }, [imageDimensions, portraitUrl, addElement, resetElements, setStrokeStyle, setStrokeColor, setStrokeWidth, setStrokeElementScale, setStrokeDensity, setStrokeAngle, setStrokeOpacity, setStrokeRandomColor, setStrokeLetter]);

  const handleFile = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        setImage(img, url);
        // Auto-start background removal
        await remove(file);
      };
      img.src = url;
    },
    [setImage, remove]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (!originalImage) {
    return (
      <div className="space-y-4 animate-fade-in">
        <span className="text-xs font-medium text-canvas-muted block">上传图片开始创作</span>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-canvas-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:border-canvas-text transition-colors"
        >
          <Upload className="w-8 h-8 text-canvas-muted" />
          <p className="text-sm text-canvas-muted">拖拽或点击上传图片</p>
          <p className="text-[10px] text-canvas-muted/60">支持 JPG, PNG, WebP</p>
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

  return (
    <div className="space-y-4 animate-fade-in">
      <span className="text-xs font-medium text-canvas-muted block">当前画布底图</span>
      <div className="p-3 sm:p-4 bg-canvas-hover rounded-xl sm:rounded-2xl flex items-center justify-between border border-canvas-border gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-canvas-border rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            {originalImageUrl ? (
              <img src={originalImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-canvas-muted" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">已上传图片</p>
            <p className="text-[10px] text-canvas-muted truncate">
              {portraitUrl ? '已智能分层' : isRemoving ? '正在抠图...' : '等待处理'}
            </p>
          </div>
        </div>
        <button
          onClick={clearImage}
          className="flex-shrink-0 text-[11px] px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-red-500 border border-canvas-border rounded-full hover:bg-red-50 transition-all flex items-center space-x-1"
        >
          <X className="w-3 h-3" />
          <span>移除</span>
        </button>
      </div>

      {/* Progress bar */}
      {isRemoving && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-canvas-muted">
            <span>AI 智能抠图中</span>
            <span className="font-mono">{removeProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-canvas-border rounded-full overflow-hidden">
            <div
              className="h-full bg-canvas-text rounded-full transition-all duration-300"
              style={{ width: `${removeProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Portrait status */}
      {portraitUrl && !isRemoving && (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-700">人像已分离，可开始编辑</span>
          </div>
          <button
            onClick={resetEdits}
            className="w-full py-2.5 text-xs font-medium text-canvas-muted border border-canvas-border rounded-xl hover:bg-canvas-hover transition-colors flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为原图</span>
          </button>
          <button
            onClick={handleLazy}
            className="w-full py-3 bg-gradient-to-r from-canvas-text to-neutral-600 text-white text-sm font-bold rounded-xl hover:from-neutral-700 hover:to-neutral-800 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <Zap className="w-4 h-4" />
            <span>LAZY</span>
          </button>
        </div>
      )}
    </div>
  );
}
