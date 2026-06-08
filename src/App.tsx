import { useCallback } from 'react';
import { Header } from './components/Header';
import { CanvasArea } from './components/Canvas/CanvasArea';
import { ControlPanel } from './components/Panel/ControlPanel';
import { useExport } from './hooks/useExport';

export default function App() {
  const { exportImage } = useExport();

  const handleExport = useCallback(() => {
    const container = document.getElementById('canvasContainer');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    exportImage(rect.width, rect.height);
  }, [exportImage]);

  return (
    <div className="min-h-screen bg-canvas-bg text-canvas-text flex flex-col selection:bg-neon-cyan selection:text-black">
      <Header onExport={handleExport} />
      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pb-8">
        <CanvasArea />
        <ControlPanel />
      </main>
    </div>
  );
}
