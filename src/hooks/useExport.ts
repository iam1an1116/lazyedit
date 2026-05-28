import { useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { exportAsPNG } from '../utils/exportCanvas';

export function useExport() {
  const store = useEditorStore();

  const exportImage = useCallback(
    (previewWidth: number, previewHeight: number) => {
      if (!store.originalImage) return;

      exportAsPNG({
        originalImage: store.originalImage,
        portraitUrl: store.portraitUrl,
        elements: store.elements,
        previewWidth,
        previewHeight,
        strokeStyle: store.strokeStyle,
        strokeWidth: store.strokeWidth,
        strokeColor: store.strokeColor,
        portraitFilter: store.portraitFilter,
      });
    },
    [store]
  );

  return { exportImage };
}
