import { useCallback } from 'react';
import { Image as ImageIcon, X, RotateCcw, Zap, Quote } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useBackgroundRemoval } from '../../hooks/useBackgroundRemoval';
import { generateRandomFill, generateRandomWords } from '../../utils/randomFill';
import { applyRandomStroke } from '../../utils/randomStroke';

export function UploadTab() {
  const originalImage = useEditorStore((s) => s.originalImage);
  const originalImageUrl = useEditorStore((s) => s.originalImageUrl);
  const isRemoving = useEditorStore((s) => s.isRemoving);
  const removeProgress = useEditorStore((s) => s.removeProgress);
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
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

  const handleWords = useCallback(async () => {
    if (!portraitUrl) return;
    await generateRandomWords({ portraitUrl, addElement });
  }, [portraitUrl, addElement]);

  if (!originalImage) {
    return (
      <div className="text-center py-6 animate-fade-in">
        <p className="text-xs text-[#555] font-display tracking-wider">上传图片开始创作</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Image preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            {originalImageUrl ? (
              <img src={originalImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#444]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium font-display tracking-wider">已上传</p>
            <p className="text-[10px] text-[#555]">
              {portraitUrl ? '已抠图' : isRemoving ? '处理中...' : '等待处理'}
            </p>
          </div>
        </div>
        <button
          onClick={clearImage}
          className="text-[10px] px-3 py-1 text-[#666] border border-[#222] rounded-full hover:text-red-400 hover:border-red-400/30 transition-all flex items-center space-x-1 font-display tracking-wider"
        >
          <X className="w-3 h-3" />
          <span>移除</span>
        </button>
      </div>

      {/* Progress */}
      {isRemoving && (
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-[#555] font-display tracking-wider">
            <span>AI 抠图中</span>
            <span className="font-mono">{removeProgress}%</span>
          </div>
          <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-neon-cyan rounded-full transition-all duration-300"
              style={{ width: `${removeProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Portrait ready */}
      {portraitUrl && !isRemoving && (
        <div className="space-y-3">
          <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full" />
            <span className="text-[10px] text-neon-cyan font-display tracking-wider">人像已分离</span>
          </div>
          <button
            onClick={resetEdits}
            className="w-full py-2.5 text-[10px] font-medium text-[#555] border border-[#222] rounded-xl hover:border-[#444] hover:text-white transition-all flex items-center justify-center space-x-1.5 font-display tracking-wider"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置为原图</span>
          </button>
          <button
            onClick={handleLazy}
            className="w-full py-3 bg-white text-black text-sm font-bold font-display tracking-[0.2em] rounded-xl hover:bg-neon-cyan transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>LAZY</span>
          </button>
          <button
            onClick={handleWords}
            className="w-full py-2.5 text-[10px] font-medium text-[#555] border border-[#222] rounded-xl hover:border-neon-magenta/30 hover:text-neon-magenta transition-all flex items-center justify-center space-x-1.5 font-display tracking-wider"
          >
            <Quote className="w-3 h-3" />
            <span>随便说点</span>
          </button>
        </div>
      )}
    </div>
  );
}
