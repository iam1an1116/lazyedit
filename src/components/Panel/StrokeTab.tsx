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
              max="64"
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
                style={{ opacity: strokeRandomColor ? 0.4 : 1 }}
              />
              <span className="text-xs font-mono text-canvas-muted">{strokeColor}</span>
              {isPattern && (
                <button
                  onClick={() => setStrokeRandomColor(!strokeRandomColor)}
                  className={`ml-auto flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] border transition-all ${
                    strokeRandomColor
                      ? 'border-canvas-text bg-canvas-text text-white'
                      : 'border-canvas-border bg-white text-canvas-muted'
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
                <div className="flex justify-between text-xs text-canvas-muted">
                  <span>元素大小</span>
                  <span className="font-mono text-canvas-text">{strokeElementScale.toFixed(1)}x</span>
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
                <div className="flex justify-between text-xs text-canvas-muted">
                  <span>密度</span>
                  <span className="font-mono text-canvas-text">{strokeDensity.toFixed(1)}x</span>
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
                  <div className="flex justify-between text-xs text-canvas-muted">
                    <span>条纹角度</span>
                    <span className="font-mono text-canvas-text">{strokeAngle}°</span>
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
                  <span className="text-xs font-medium text-canvas-muted block">字母设置</span>
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
                      className="w-12 h-9 text-center text-sm font-mono bg-white border border-canvas-border rounded-lg focus:outline-none focus:border-canvas-text disabled:opacity-40 disabled:bg-canvas-hover"
                    />
                    <button
                      onClick={() => setStrokeLetter(strokeLetter === 'random' ? 'A' : 'random')}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] border transition-all ${
                        strokeLetter === 'random'
                          ? 'border-canvas-text bg-canvas-text text-white'
                          : 'border-canvas-border bg-white text-canvas-muted'
                      }`}
                    >
                      <CaseSensitive className="w-3 h-3" />
                      <span>每字母随机</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-canvas-muted">
                  <span>不透明度</span>
                  <span className="font-mono text-canvas-text">{Math.round(strokeOpacity * 100)}%</span>
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
        className="w-full py-2.5 bg-canvas-text text-white text-xs font-medium rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-40 flex items-center justify-center space-x-1.5"
      >
        <Shuffle className="w-3.5 h-3.5" />
        <span>随便描一下</span>
      </button>
    </div>
  );
}
