import { useEditorStore } from '../../store/editorStore';
import type { PortraitFilter } from '../../types';

const filterOptions: { key: PortraitFilter; label: string; desc: string }[] = [
  { key: 'normal', label: '原图色调', desc: '保持原始色彩' },
  { key: 'silhouette', label: '纯色剪影', desc: '高对比度黑色' },
  { key: 'bw', label: '高级黑白', desc: 'Monochrome 风格' },
  { key: 'glitch', label: 'RGB 故障', desc: '通道偏移效果' },
];

export function FilterTab() {
  const portraitFilter = useEditorStore((s) => s.portraitFilter);
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const setPortraitFilter = useEditorStore((s) => s.setPortraitFilter);

  const disabled = !portraitUrl;

  return (
    <div className="space-y-4 animate-fade-in">
      <span className="text-xs font-medium text-canvas-muted block">
        独立人像图层滤镜（背景不受影响）
      </span>

      {disabled && (
        <div className="p-3 bg-canvas-hover rounded-xl text-xs text-canvas-muted text-center">
          请先上传图片并完成抠图
        </div>
      )}

      <div className="space-y-2">
        {filterOptions.map((opt) => (
          <label
            key={opt.key}
            onClick={() => !disabled && setPortraitFilter(opt.key)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              disabled
                ? 'opacity-40 cursor-not-allowed bg-canvas-hover'
                : portraitFilter === opt.key
                ? 'bg-canvas-text text-white'
                : 'bg-canvas-hover hover:bg-canvas-border'
            }`}
          >
            <div>
              <span className="text-xs font-medium">{opt.label}</span>
              <p className="text-[10px] opacity-60">{opt.desc}</p>
            </div>
            <input
              type="radio"
              name="filter"
              checked={portraitFilter === opt.key}
              readOnly
              className="w-4 h-4 accent-canvas-accent"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
