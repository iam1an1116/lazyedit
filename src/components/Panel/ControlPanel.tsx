import { useEditorStore } from '../../store/editorStore';
import { UploadTab } from './UploadTab';
import { LayersTab } from './LayersTab';
import { StrokeTab } from './StrokeTab';
import { FilterTab } from './FilterTab';
import { RotateCcw } from 'lucide-react';

const tabs = [
  { key: 'upload' as const, label: '主图', color: 'text-neon-cyan' },
  { key: 'layers' as const, label: '加插', color: 'text-neon-magenta' },
  { key: 'stroke' as const, label: '描边', color: 'text-neon-yellow' },
  { key: 'filter' as const, label: '滤镜', color: 'text-neon-green' },
];

export function ControlPanel() {
  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const resetAll = useEditorStore((s) => s.resetAll);

  return (
    <div className="w-full max-w-[520px]">
      {/* Tab buttons */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-2xl sm:text-3xl font-bold font-display tracking-wider transition-all duration-300 ${
              activeTab === tab.key
                ? `${tab.color} scale-110`
                : 'text-[#333] hover:text-[#555]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 animate-slide-up">
        <div className="space-y-4 sm:space-y-5">
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'layers' && <LayersTab />}
          {activeTab === 'stroke' && <StrokeTab />}
          {activeTab === 'filter' && <FilterTab />}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#1a1a1a] flex justify-between items-center text-[10px] text-[#444] font-display tracking-wider">
          <span>LAZYEDIT</span>
          <button
            onClick={resetAll}
            className="hover:text-white transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
}
