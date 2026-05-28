import { useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '../../store/editorStore';
import type { CanvasElement } from '../../types';
import { X, RotateCw, MoveDiagonal } from 'lucide-react';

interface DraggableElementProps {
  element: CanvasElement;
}

export function DraggableElement({ element }: DraggableElementProps) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const selectElement = useEditorStore((s) => s.selectElement);
  const selectedId = useEditorStore((s) => s.selectedElementId);
  const isSelected = selectedId === element.id;

  const rndRef = useRef<Rnd>(null);

  // Rotation handle drag
  const onRotateStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const rndEl = rndRef.current?.resizableElement?.current;
    if (!rndEl) return;

    const onMove = (ev: PointerEvent) => {
      const rect = rndEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
      updateElement(element.id, { rotation: Math.round(angle) });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [element.id, updateElement]);

  // Custom resize handle drag
  const onResizeStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = element.width;
    const startH = element.height;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newW = Math.max(20, startW + dx);
      const newH = Math.max(20, startH + dy);
      const updates: Partial<CanvasElement> = { width: newW, height: newH };
      if (element.type === 'text') {
        const scale = Math.min(newW / startW, newH / startH);
        (updates as any).fontSize = Math.max(8, Math.round(element.fontSize * scale));
        (updates as any).strokeWidth = Math.max(0, Math.round(element.strokeWidth * scale));
      }
      updateElement(element.id, updates);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [element, updateElement]);

  return (
    <Rnd
      ref={rndRef}
      position={{ x: element.x, y: element.y }}
      size={{ width: element.width, height: element.height }}
      bounds="parent"
      onMouseDown={(e: MouseEvent) => {
        e.stopPropagation();
        selectElement(element.id);
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      onDragStop={(_e, d) => {
        updateElement(element.id, { x: d.x, y: d.y });
      }}
      style={{ zIndex: isSelected ? 60 : 50, touchAction: 'none' }}
      enableResizing={false}
      dragHandleClassName="drag-handle"
    >
      <div
        className={`relative w-full h-full group ${
          isSelected ? 'ring-2 ring-canvas-accent' : ''
        }`}
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

        {/* Rotation handle */}
        {isSelected && (
          <div
            onPointerDown={onRotateStart}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 w-8 h-8 bg-white border-2 border-canvas-accent rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm"
            style={{ touchAction: 'none' }}
          >
            <RotateCw className="w-3 h-3 text-canvas-accent" />
          </div>
        )}

        {/* Resize handle */}
        {isSelected && (
          <div
            onPointerDown={onResizeStart}
            className="absolute -bottom-2 -right-2 z-50 w-7 h-7 bg-white border-2 border-canvas-accent rounded-full flex items-center justify-center cursor-nwse-resize shadow-sm"
            style={{ touchAction: 'none' }}
          >
            <MoveDiagonal className="w-3.5 h-3.5 text-canvas-accent" />
          </div>
        )}

        {/* Element content */}
        {element.type === 'text' ? (
          <div
            className="drag-handle w-full h-full flex items-center justify-center cursor-move select-none overflow-hidden"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              color: element.color,
              opacity: element.opacity,
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
              clipPath: element.shapeType === 'triangle'
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : element.shapeType === 'star'
                ? 'polygon(50% 0%, 61.8% 34.5%, 97.6% 34.5%, 68.9% 56.5%, 79.4% 90.5%, 50% 69%, 20.6% 90.5%, 31.1% 56.5%, 2.4% 34.5%, 38.2% 34.5%)'
                : undefined,
            }}
          />
        )}
      </div>
    </Rnd>
  );
}
