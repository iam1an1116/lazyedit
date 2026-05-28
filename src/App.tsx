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
    <div className="min-h-screen bg-canvas-bg text-canvas-text font-sans antialiased flex flex-col selection:bg-black selection:text-white">
      <Header onExport={handleExport} />
      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8 max-w-[1600px] w-full mx-auto">
        <CanvasArea />
        <ControlPanel />
      </main>
    </div>
  );
}
