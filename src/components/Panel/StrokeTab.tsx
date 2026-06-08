import { useEditorStore } from '../../store/editorStore';
import type { StrokeStyle } from '../../types';
import { applyRandomStroke } from '../../utils/randomStroke';
import { Shuffle, Palette, CaseSensitive } from 'lucide-react';

const strokeOptions: { key: StrokeStyle; label: string }[] = [
  { key: 'none', label: '无描边' },
  { key: 'solid', label: '纯色块' },
  { key: 'dots', label: '复古波点' },
  { key: 'stripes', label: '波普条纹' },
  { key: 'stars', label: '星星描边' },
  { key: 'letters', label: '字母描边' },
];

const PATTERN_STYLES: StrokeStyle[] = ['dots', 'stripes', 'stars', 'letters'];

export function StrokeTab() {
  const strokeStyle = useEditorStore((s) => s.strokeStyle);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const strokeColor = useEditorStore((s) => s.strokeColor);
  const strokeElementScale = useEditorStore((s) => s.strokeElementScale);
  const strokeDensity = useEditorStore((s) => s.strokeDensity);
  const strokeAngle = useEditorStore((s) => s.strokeAngle);
  const strokeOpacity = useEditorStore((s) => s.strokeOpacity);
  const portraitUrl = useEditorStore((s) => s.portraitUrl);
  const setStrokeStyle = useEditorStore((s) => s.setStrokeStyle);
  const setStrokeWidth = useEditorStore((s) => s.setStrokeWidth);
  const setStrokeColor = useEditorStore((s) => s.setStrokeColor);
  const setStrokeElementScale = useEditorStore((s) => s.setStrokeElementScale);
  const setStrokeDensity = useEditorStore((s) => s.setStrokeDensity);
  const setStrokeAngle = useEditorStore((s) => s.setStrokeAngle);
  const setStrokeOpacity = useEditorStore((s) => s.setStrokeOpacity);
  const strokeRandomColor = useEditorStore((s) => s.strokeRandomColor);
  const setStrokeRandomColor = useEditorStore((s) => s.setStrokeRandomColor);
  const strokeLetter = useEditorStore((s) => s.strokeLetter);
  const setStrokeLetter = useEditorStore((s) => s.setStrokeLetter);
  const disabled = !portraitUrl;
  const isPattern = PATTERN_STYLES.includes(strokeStyle);

  const randomStroke = () => {
    applyRandomStroke({
      setStrokeStyle, setStrokeColor, setStrokeWidth,
      setStrokeElementScale, setStrokeDensity, setStrokeAngle, setStrokeOpacity,
      setStrokeRandomColor, setStrokeLetter,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {disabled && (
        <div className="p-3 bg-[#111] rounded-xl text-[10px] text-[#444] text-center font-display tracking-wider">
          请先上传图片并完成抠图
        </div>
      )}

      <div>
        <span className="text-[10px] font-display tracking-wider text-[#555] block mb-3">描边样式</span>
        <div className="grid grid-cols-3 gap-2">
          {strokeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStrokeStyle(opt.key)}
              disabled={disabled}
              className={`p-2.5 text-[10px] font-display tracking-wider rounded-lg border transition-all disabled:opacity-20 ${
                strokeStyle === opt.key
                  ? 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow'
                  : 'border-[#1a1a1a] bg-[#111] text-[#555] hover:border-[#333] hover:text-white'
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
            <div className="flex justify-between text-[10px] text-[#555] font-display tracking-wider">
              <span>描边粗细</span>
              <span className="font-mono text-white">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="64"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-display tracking-wider text-[#555] block">描边颜色</span>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8"
                style={{ opacity: strokeRandomColor ? 0.3 : 1 }}
              />
              <span className="text-[10px] font-mono text-[#555]">{strokeColor}</span>
              {isPattern && (
                <button
                  onClick={() => setStrokeRandomColor(!strokeRandomColor)}
                  className={`ml-auto flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] border transition-all font-display tracking-wider ${
                    strokeRandomColor
                      ? 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow'
                      : 'border-[#1a1a1a] bg-[#111] text-[#555]'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  <span>随机</span>
                </button>
              )}
            </div>
          </div>

          {isPattern && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[#555] font-display tracking-wider">
                  <span>元素大小</span>
                  <span className="font-mono text-white">{strokeElementScale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="3"
                  step="0.1"
                  value={strokeElementScale}
                  onChange={(e) => setStrokeElementScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[#555] font-display tracking-wider">
                  <span>密度</span>
                  <span className="font-mono text-white">{strokeDensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="3"
                  step="0.1"
                  value={strokeDensity}
                  onChange={(e) => setStrokeDensity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {strokeStyle === 'stripes' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-[#555] font-display tracking-wider">
                    <span>条纹角度</span>
                    <span className="font-mono text-white">{strokeAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={strokeAngle}
                    onChange={(e) => setStrokeAngle(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {strokeStyle === 'letters' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-display tracking-wider text-[#555] block">字母设置</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={1}
                      value={strokeLetter === 'random' ? '' : strokeLetter}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                        if (v) setStrokeLetter(v);
                      }}
                      placeholder="A"
                      disabled={strokeLetter === 'random'}
                      className="w-12 h-8 text-center text-sm font-mono bg-[#111] border border-[#222] rounded-lg focus:outline-none focus:border-neon-yellow/50 disabled:opacity-30 text-white"
                    />
                    <button
                      onClick={() => setStrokeLetter(strokeLetter === 'random' ? 'A' : 'random')}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] border transition-all font-display tracking-wider ${
                        strokeLetter === 'random'
                          ? 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow'
                          : 'border-[#1a1a1a] bg-[#111] text-[#555]'
                      }`}
                    >
                      <CaseSensitive className="w-3 h-3" />
                      <span>随机</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[#555] font-display tracking-wider">
                  <span>不透明度</span>
                  <span className="font-mono text-white">{Math.round(strokeOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={strokeOpacity}
                  onChange={(e) => setStrokeOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </>
      )}

      <button
        onClick={randomStroke}
        disabled={disabled}
        className="w-full py-2.5 bg-neon-yellow/10 text-neon-yellow text-[10px] font-display tracking-[0.15em] rounded-xl border border-neon-yellow/20 hover:bg-neon-yellow/20 transition-all disabled:opacity-20 flex items-center justify-center space-x-1.5"
      >
        <Shuffle className="w-3 h-3" />
        <span>随便描一下</span>
      </button>
    </div>
  );
}
