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
    <div className="space-y-3 animate-fade-in">
      <span className="text-[10px] font-display tracking-wider text-[#555] block">
        人像图层滤镜
      </span>

      {disabled && (
        <div className="p-3 bg-[#111] rounded-xl text-[10px] text-[#444] text-center font-display tracking-wider">
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
                ? 'opacity-30 cursor-not-allowed bg-[#0a0a0a]'
                : portraitFilter === opt.key
                ? 'bg-neon-green/10 border border-neon-green/30'
                : 'bg-[#111] border border-transparent hover:border-[#222]'
            }`}
          >
            <div>
              <span className={`text-xs font-display tracking-wider ${portraitFilter === opt.key && !disabled ? 'text-neon-green' : ''}`}>
                {opt.label}
              </span>
              <p className="text-[10px] text-[#444]">{opt.desc}</p>
            </div>
            <div className={`w-2 h-2 rounded-full transition-all ${
              portraitFilter === opt.key && !disabled ? 'bg-neon-green' : 'bg-[#222]'
            }`} />
          </label>
        ))}
      </div>
    </div>
  );
}
