import { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { DraggableElement } from './DraggableElement';

export function ElementsLayer() {
  const elements = useEditorStore((s) => s.elements);
  const selectElement = useEditorStore((s) => s.selectElement);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 overflow-hidden"
      style={{ contain: 'layout style' }}
      onClick={() => selectElement(null)}
    >
      {elements.map((el) => (
        <DraggableElement key={el.id} element={el} containerRef={containerRef} />
      ))}
    </div>
  );
}
