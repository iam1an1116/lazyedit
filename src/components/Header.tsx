import { Download } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="w-full px-6 sm:px-10 py-4 flex justify-between items-center sticky top-0 z-50">
      <span className="text-xl sm:text-2xl font-bold tracking-tight lowercase font-display">
        lazyedit<span className="text-neon-cyan">.</span>
      </span>

      <button
        onClick={onExport}
        className="flex items-center space-x-2 px-5 py-2 bg-white text-black text-sm font-semibold font-display tracking-wider rounded-full hover:bg-neon-cyan hover:text-black transition-all duration-300 group"
      >
        <span>EXPORT</span>
        <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
      </button>
    </header>
  );
}
