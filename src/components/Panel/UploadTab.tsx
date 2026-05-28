import { useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, X, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useBackgroundRemoval } from '../../hooks/useBackgroundRemoval';

export function UploadTab() {
  const originalImage = useEditorStore((s) => s.originalImage);
  const originalImageUrl = useEditorStore((s) => s.originalImageUrl);
  const isRemoving = useEditorStore((s) => s.isRemoving);
  const removeProgress = useEditorStore((s) => s.removeProgress);
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const setImage = useEditorStore((s) => s.setImage);
  const clearImage = useEditorStore((s) => s.clearImage);
  const resetEdits = useEditorStore((s) => s.resetEdits);
  const { remove } = useBackgroundRemoval();
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="p-4 bg-canvas-hover rounded-2xl flex items-center justify-between border border-canvas-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-canvas-border rounded-xl overflow-hidden flex items-center justify-center">
            {originalImageUrl ? (
              <img src={originalImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-canvas-muted" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium truncate w-40">已上传图片</p>
            <p className="text-[10px] text-canvas-muted">
              {portraitUrl ? '已智能分层' : isRemoving ? '正在抠图...' : '等待处理'}
            </p>
          </div>
        </div>
        <button
          onClick={clearImage}
          className="text-xs px-3 py-1.5 bg-white text-red-500 border border-canvas-border rounded-full hover:bg-red-50 transition-all flex items-center space-x-1"
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
        </div>
      )}
    </div>
  );
}
