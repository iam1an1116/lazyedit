import { useEditorStore } from '../../store/editorStore';

export function BackgroundLayer() {
  const originalImageUrl = useEditorStore((s) => s.originalImageUrl);

  if (!originalImageUrl) {
    return (
      <div className="absolute inset-0 z-10 bg-[#0a0a0a] flex items-center justify-center overflow-hidden rounded-2xl" />
    );
  }

  return (
    <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl">
      <img
        src={originalImageUrl}
        alt="Background"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}
