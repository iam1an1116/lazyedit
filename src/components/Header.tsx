import { Download, Sun } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="w-full px-8 py-5 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-canvas-border sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold tracking-tight lowercase">
          lazyedit<span className="text-canvas-accent font-light">.</span>
        </span>
        <span className="text-xs px-2 py-0.5 bg-canvas-hover text-canvas-muted rounded-full">
          v1.0 alpha
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-canvas-muted hover:text-canvas-text hover:bg-canvas-hover rounded-full transition-all duration-200">
          <Sun className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-5 py-2.5 bg-canvas-text hover:bg-neutral-700 text-white text-sm font-medium rounded-full shadow-sm hover:shadow transition-all duration-200 group"
        >
          <span>导出艺术海报</span>
          <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>
    </header>
  );
}
