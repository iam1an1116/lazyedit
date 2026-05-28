import { Sparkles, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { UploadTab } from './UploadTab';
import { LayersTab } from './LayersTab';
import { StrokeTab } from './StrokeTab';
import { FilterTab } from './FilterTab';

const tabs = [
  { key: 'upload' as const, label: '主图' },
  { key: 'layers' as const, label: '加插' },
  { key: 'stroke' as const, label: '描边' },
  { key: 'filter' as const, label: '滤镜' },
];

export function ControlPanel() {
  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const resetAll = useEditorStore((s) => s.resetAll);

  return (
    <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-canvas-border shadow-sm p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-canvas-bg">
          <div>
            <h2 className="text-base font-semibold">艺术编辑面板</h2>
            <p className="text-xs text-canvas-muted">自由编排人像与创意的层级</p>
          </div>
          <Sparkles className="w-5 h-5 text-canvas-muted" />
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-4 bg-canvas-bg p-1 rounded-full mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 text-xs font-medium rounded-full capitalize transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-canvas-text shadow-sm'
                  : 'text-canvas-muted hover:text-canvas-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6 min-h-[280px]">
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'layers' && <LayersTab />}
          {activeTab === 'stroke' && <StrokeTab />}
          {activeTab === 'filter' && <FilterTab />}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-canvas-bg flex justify-between items-center text-[11px] text-[#9A9A95]">
        <span>设计语言：极简浅色 / lazyedit</span>
        <button
          onClick={resetAll}
          className="hover:text-canvas-text underline underline-offset-2 flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置所有画布</span>
        </button>
      </div>
    </div>
  );
}
