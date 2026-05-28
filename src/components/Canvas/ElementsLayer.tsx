import { useEditorStore } from '../../store/editorStore';
import { DraggableElement } from './DraggableElement';

export function ElementsLayer() {
  const elements = useEditorStore((s) => s.elements);
  const selectElement = useEditorStore((s) => s.selectElement);

  return (
    <div
      className="absolute inset-0 z-20"
      onClick={() => selectElement(null)}
    >
      {elements.map((el) => (
        <DraggableElement key={el.id} element={el} />
      ))}
    </div>
  );
}
