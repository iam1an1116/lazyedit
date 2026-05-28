import { useEditorStore } from '../../store/editorStore';
import type { StrokeStyle } from '../../types';

const strokeOptions: { key: StrokeStyle; label: string }[] = [
  { key: 'none', label: '无描边' },
  { key: 'solid', label: '纯色块' },
  { key: 'dots', label: '复古波点' },
  { key: 'stripes', label: '波普条纹' },
  { key: 'stars', label: '星星描边' },
  { key: 'letters', label: '字母描边' },
];

export function StrokeTab() {
  const strokeStyle = useEditorStore((s) => s.strokeStyle);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const strokeColor = useEditorStore((s) => s.strokeColor);
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const setStrokeStyle = useEditorStore((s) => s.setStrokeStyle);
  const setStrokeWidth = useEditorStore((s) => s.setStrokeWidth);
  const setStrokeColor = useEditorStore((s) => s.setStrokeColor);
  const disabled = !portraitUrl;

  return (
    <div className="space-y-5 animate-fade-in">
      {disabled && (
        <div className="p-3 bg-canvas-hover rounded-xl text-xs text-canvas-muted text-center">
          请先上传图片并完成抠图
        </div>
      )}

      <div>
        <span className="text-xs font-medium text-canvas-muted block mb-3">边缘检测描边样式</span>
        <div className="grid grid-cols-2 gap-2">
          {strokeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStrokeStyle(opt.key)}
              disabled={disabled}
              className={`p-3 text-xs font-medium rounded-xl border text-center transition-all disabled:opacity-40 ${
                strokeStyle === opt.key
                  ? 'border-canvas-text bg-canvas-text text-white'
                  : 'border-canvas-border bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {strokeStyle !== 'none' && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-canvas-muted">
              <span>描边粗细</span>
              <span className="font-mono text-canvas-text">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-canvas-muted block">描边颜色</span>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-10 h-10"
              />
              <span className="text-xs font-mono text-canvas-muted">{strokeColor}</span>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
