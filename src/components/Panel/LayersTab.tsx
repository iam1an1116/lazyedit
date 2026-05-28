import { useState } from 'react';
import { Type, Square, Triangle, Shuffle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { CanvasElement, TextElement, ShapeElement, ShapeType } from '../../types';

let nextId = 1;
function genId() {
  return `el-${nextId++}-${Date.now()}`;
}

const FONTS = {
  minimalist: [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'DM Sans', value: 'DM Sans, sans-serif' },
    { label: 'Space Mono', value: 'Space Mono, monospace' },
    { label: 'Helvetica', value: 'Helvetica Neue, Helvetica, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
  ],
  fancy: [
    { label: 'Pacifico', value: 'Pacifico, cursive' },
    { label: 'Lobster', value: 'Lobster, cursive' },
    { label: 'Permanent Marker', value: 'Permanent Marker, cursive' },
    { label: 'Press Start 2P', value: 'Press Start 2P, cursive' },
  ],
};

const ALL_FONTS = [...FONTS.minimalist, ...FONTS.fancy];

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function randomLetters(): string {
  const len = 2 + Math.floor(Math.random() * 5);
  return Array.from({ length: len }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  ).join('');
}

export function LayersTab() {
  const addElement = useEditorStore((s) => s.addElement);
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedElementId);
  const updateElement = useEditorStore((s) => s.updateElement);
  const selectElement = useEditorStore((s) => s.selectElement);
  const imageDimensions = useEditorStore((s) => s.imageDimensions);

  const [randomCount, setRandomCount] = useState(5);

  const addText = () => {
    const el: TextElement = {
      type: 'text',
      id: genId(),
      x: 40,
      y: 60,
      width: 200,
      height: 60,
      content: 'YOUR TEXT',
      fontSize: 28,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 0,
      rotation: 0,
      bold: true,
      italic: false,
    };
    addElement(el);
    selectElement(el.id);
  };

  const addShape = (shapeType: ShapeType = 'rectangle') => {
    const el: ShapeElement = {
      type: 'shape',
      shapeType,
      id: genId(),
      x: 80,
      y: 120,
      width: 100,
      height: 100,
      color: '#FF4500',
      borderRadius: shapeType === 'circle' ? 50 : 0,
      opacity: 0.4,
      rotation: 0,
    };
    addElement(el);
    selectElement(el.id);
  };

  const generateRandom = () => {
    // 先清空已有元素
    useEditorStore.getState().resetElements();

    const container = document.getElementById('canvasContainer');
    const cw = container?.clientWidth || 320;
    const ch = container?.clientHeight || 427;

    // Much smaller base: shorter side / 12, scaled down further by count
    const refSize = imageDimensions
      ? Math.min(imageDimensions.width, imageDimensions.height) / 12
      : 60;
    const baseSize = Math.max(12, refSize / (1 + randomCount * 0.3));

    const shapeTypes: ShapeType[] = ['rectangle', 'circle', 'triangle'];

    // Grid-based scatter: divide canvas into cells, assign one element per cell
    const cols = Math.ceil(Math.sqrt(randomCount * (cw / ch)));
    const rows = Math.ceil(randomCount / cols);
    const cellW = cw / cols;
    const cellH = ch / rows;

    // Build shuffled cell indices
    const cells = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    for (let i = 0; i < randomCount; i++) {
      const cellIdx = cells[i];
      const col = cellIdx % cols;
      const row = Math.floor(cellIdx / cols);

      // Size variation: 40% ~ 130% of base
      const sizeMultiplier = 0.4 + Math.random() * 0.9;
      const size = Math.round(baseSize * sizeMultiplier);

      // Position within cell with jitter
      const jitterX = (Math.random() - 0.5) * cellW * 0.6;
      const jitterY = (Math.random() - 0.5) * cellH * 0.6;
      const x = col * cellW + cellW / 2 - size / 2 + jitterX;
      const y = row * cellH + cellH / 2 - size / 2 + jitterY;

      // Clamp to canvas bounds
      const cx = Math.max(0, Math.min(cw - size, x));
      const cy = Math.max(0, Math.min(ch - size, y));
      const rotation = Math.round((Math.random() - 0.5) * 60);

      const isText = Math.random() > 0.5;

      if (isText) {
        const font = ALL_FONTS[Math.floor(Math.random() * ALL_FONTS.length)];
        const el: TextElement = {
          type: 'text',
          id: genId(),
          x: Math.round(cx),
          y: Math.round(cy),
          width: size * 2,
          height: size,
          content: randomLetters(),
          fontSize: Math.round(size * 0.6),
          fontFamily: font.value,
          color: randomHex(),
          strokeColor: '#000000',
          strokeWidth: 0,
          rotation,
          bold: Math.random() > 0.5,
          italic: Math.random() > 0.7,
        };
        addElement(el);
      } else {
        const sizeRatio = size / (baseSize * 1.3);
        const opacity = sizeRatio > 0.3 ? 0.3 + Math.random() * 0.4 : 1;

        const st = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const el: ShapeElement = {
          type: 'shape',
          shapeType: st,
          id: genId(),
          x: Math.round(cx),
          y: Math.round(cy),
          width: size,
          height: size,
          color: randomHex(),
          borderRadius: st === 'circle' ? 50 : 0,
          opacity,
          rotation,
        };
        addElement(el);
      }
    }
  };

  const selected = elements.find((e) => e.id === selectedId);

  return (
    <div className="space-y-4 animate-fade-in">
      <span className="text-xs font-medium text-canvas-muted block">在人像背后插入元素</span>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={addText}
          className="flex items-center justify-center space-x-1.5 sm:space-x-2 p-3 sm:p-4 bg-white border border-canvas-deep hover:border-canvas-text rounded-xl sm:rounded-2xl transition-all group"
        >
          <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-canvas-muted group-hover:text-canvas-text" />
          <span className="text-[11px] sm:text-xs font-medium">置入文字</span>
        </button>
        <button
          onClick={() => addShape()}
          className="flex items-center justify-center space-x-1.5 sm:space-x-2 p-3 sm:p-4 bg-white border border-canvas-deep hover:border-canvas-text rounded-xl sm:rounded-2xl transition-all group"
        >
          <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-canvas-muted group-hover:text-canvas-text" />
          <span className="text-[11px] sm:text-xs font-medium">置入形状</span>
        </button>
      </div>

      {/* Random fill */}
      <div className="p-3 sm:p-4 bg-canvas-hover rounded-xl sm:rounded-2xl border border-canvas-border space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-canvas-muted">随便塞一下</span>
          <Shuffle className="w-4 h-4 text-canvas-muted" />
        </div>
        <div className="flex items-center justify-between text-xs text-canvas-muted">
          <span>元素数量</span>
          <span className="font-mono text-canvas-text">{randomCount}</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={randomCount}
          onChange={(e) => setRandomCount(Number(e.target.value))}
          className="w-full"
        />
        <button
          onClick={generateRandom}
          className="w-full py-2.5 bg-canvas-text text-white text-xs font-medium rounded-xl hover:bg-neutral-700 transition-colors"
        >
          随便塞一下
        </button>
      </div>

      {/* Element list */}
      {elements.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-canvas-muted block">已添加元素 ({elements.length})</span>
          {elements.map((el) => (
            <div
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedId === el.id
                  ? 'border-canvas-accent bg-canvas-accent/5'
                  : 'border-canvas-border bg-white hover:border-canvas-deep'
              }`}
            >
              <div className="flex items-center space-x-2">
                {el.type === 'text' ? (
                  <Type className="w-3.5 h-3.5 text-canvas-muted" />
                ) : el.type === 'shape' && el.shapeType === 'triangle' ? (
                  <Triangle className="w-3.5 h-3.5 text-canvas-muted" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-canvas-muted" />
                )}
                <span className="text-xs truncate max-w-[120px]">
                  {el.type === 'text' ? el.content : el.shapeType === 'triangle' ? '三角形' : '色块'}
                </span>
              </div>
              <div
                className="w-4 h-4 rounded-full border border-canvas-border"
                style={{ backgroundColor: el.color }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Selected element properties */}
      {selected && (
        <div className="space-y-3 p-4 bg-canvas-hover rounded-2xl border border-canvas-border">
          <span className="text-xs font-medium text-canvas-muted block">属性编辑</span>

          {selected.type === 'text' && (
            <>
              <label className="block space-y-1">
                <span className="text-[10px] text-canvas-muted">文字内容</span>
                <input
                  type="text"
                  value={selected.content}
                  onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-canvas-border rounded-xl focus:outline-none focus:border-canvas-text"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] text-canvas-muted">字体</span>
                <select
                  value={selected.fontFamily}
                  onChange={(e) => updateElement(selected.id, { fontFamily: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-canvas-border rounded-xl focus:outline-none focus:border-canvas-text appearance-none cursor-pointer"
                >
                  <optgroup label="极简风格">
                    {FONTS.minimalist.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="花字风格">
                    {FONTS.fancy.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </optgroup>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-[10px] text-canvas-muted">字号</span>
                  <input
                    type="number"
                    value={selected.fontSize}
                    onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-canvas-border rounded-xl focus:outline-none focus:border-canvas-text"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] text-canvas-muted">颜色</span>
                  <input
                    type="color"
                    value={selected.color}
                    onChange={(e) => updateElement(selected.id, { color: e.target.value })}
                    className="w-full h-[34px] bg-white border border-canvas-border rounded-xl"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[10px] text-canvas-muted">描边粗细</span>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={selected.strokeWidth}
                  onChange={(e) => updateElement(selected.id, { strokeWidth: Number(e.target.value) })}
                  className="w-full"
                />
              </label>
              {selected.strokeWidth > 0 && (
                <label className="block space-y-1">
                  <span className="text-[10px] text-canvas-muted">描边颜色</span>
                  <input
                    type="color"
                    value={selected.strokeColor}
                    onChange={(e) => updateElement(selected.id, { strokeColor: e.target.value })}
                    className="w-full h-[34px] bg-white border border-canvas-border rounded-xl"
                  />
                </label>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => updateElement(selected.id, { bold: !selected.bold })}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                    selected.bold
                      ? 'bg-canvas-text text-white border-canvas-text'
                      : 'bg-white text-canvas-text border-canvas-border'
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() => updateElement(selected.id, { italic: !selected.italic })}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all italic ${
                    selected.italic
                      ? 'bg-canvas-text text-white border-canvas-text'
                      : 'bg-white text-canvas-text border-canvas-border'
                  }`}
                >
                  I
                </button>
              </div>
            </>
          )}

          {selected.type === 'shape' && (
            <>
              {/* Shape type selector */}
              <div>
                <span className="text-[10px] text-canvas-muted block mb-2">形状类型</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['rectangle', 'circle', 'triangle'] as ShapeType[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateElement(selected.id, { shapeType: st, borderRadius: st === 'circle' ? 50 : 0 })}
                      className={`p-2 text-[10px] rounded-xl border transition-all flex items-center justify-center space-x-1 ${
                        selected.shapeType === st
                          ? 'border-canvas-text bg-canvas-text text-white'
                          : 'border-canvas-border bg-white'
                      }`}
                    >
                      {st === 'rectangle' && <Square className="w-3 h-3" />}
                      {st === 'circle' && <div className="w-3 h-3 rounded-full border border-current" />}
                      {st === 'triangle' && <Triangle className="w-3 h-3" />}
                      <span>{st === 'rectangle' ? '矩形' : st === 'circle' ? '圆形' : '三角'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-[10px] text-canvas-muted">颜色</span>
                  <input
                    type="color"
                    value={selected.color}
                    onChange={(e) => updateElement(selected.id, { color: e.target.value })}
                    className="w-full h-[34px] bg-white border border-canvas-border rounded-xl"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] text-canvas-muted">透明度</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selected.opacity}
                    onChange={(e) => updateElement(selected.id, { opacity: Number(e.target.value) })}
                    className="w-full"
                  />
                </label>
              </div>
              {selected.shapeType === 'rectangle' && (
                <label className="block space-y-1">
                  <span className="text-[10px] text-canvas-muted">圆角</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selected.borderRadius}
                    onChange={(e) => updateElement(selected.id, { borderRadius: Number(e.target.value) })}
                    className="w-full"
                  />
                </label>
              )}
            </>
          )}

          <label className="block space-y-1">
            <span className="text-[10px] text-canvas-muted">旋转角度</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={selected.rotation}
              onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) })}
              className="w-full"
            />
          </label>
        </div>
      )}
    </div>
  );
}
