import { Rnd } from 'react-rnd';
import { useEditorStore } from '../../store/editorStore';
import type { CanvasElement } from '../../types';
import { X } from 'lucide-react';

interface DraggableElementProps {
  element: CanvasElement;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DraggableElement({ element }: DraggableElementProps) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const selectElement = useEditorStore((s) => s.selectElement);
  const selectedId = useEditorStore((s) => s.selectedElementId);
  const isSelected = selectedId === element.id;

  return (
    <Rnd
      position={{ x: element.x, y: element.y }}
      size={{ width: element.width, height: element.height }}
      bounds="parent"
      onMouseDown={(e: MouseEvent) => {
        e.stopPropagation();
        selectElement(element.id);
      }}
      onDragStop={(_e, d) => {
        updateElement(element.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateElement(element.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        });
      }}
      style={{ zIndex: isSelected ? 60 : 50 }}
      enableResizing={true}
      resizeHandleStyles={
        isSelected
          ? undefined
          : {
              bottom: { display: 'none' },
              bottomLeft: { display: 'none' },
              bottomRight: { display: 'none' },
              left: { display: 'none' },
              right: { display: 'none' },
              top: { display: 'none' },
              topLeft: { display: 'none' },
              topRight: { display: 'none' },
            }
      }
      dragHandleClassName="drag-handle"
    >
      <div
        className={`relative w-full h-full group ${
          isSelected ? 'ring-2 ring-canvas-accent' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Delete button */}
        {isSelected && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              removeElement(element.id);
            }}
            className="absolute top-1 right-1 z-50 w-5 h-5 bg-canvas-text text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Element content */}
        {element.type === 'text' ? (
          <div
            className="drag-handle w-full h-full flex items-center justify-center cursor-move select-none overflow-hidden"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              color: element.color,
              fontWeight: element.bold ? 'bold' : 'normal',
              fontStyle: element.italic ? 'italic' : 'normal',
              WebkitTextStroke: element.strokeWidth > 0 ? `${element.strokeWidth}px ${element.strokeColor}` : 'none',
              transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {element.content}
          </div>
        ) : (
          <div
            className="drag-handle w-full h-full cursor-move"
            style={{
              backgroundColor: element.color,
              borderRadius: element.shapeType === 'circle' ? '50%' : element.borderRadius,
              opacity: element.opacity,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
              clipPath: element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
            }}
          />
        )}
      </div>
    </Rnd>
  );
}
