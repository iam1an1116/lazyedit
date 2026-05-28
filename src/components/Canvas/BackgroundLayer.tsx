import { useEditorStore } from '../../store/editorStore';

export function BackgroundLayer() {
  const originalImageUrl = useEditorStore((s) => s.originalImageUrl);

  if (!originalImageUrl) {
    return (
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#D4E2D5] to-[#E9CCD2] flex items-center justify-center">
        <p className="text-xs text-canvas-muted/60 font-mono uppercase tracking-widest">
          上传图片开始创作
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10">
      <img
        src={originalImageUrl}
        alt="Background"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}
