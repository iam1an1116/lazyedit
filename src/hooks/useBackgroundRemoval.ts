import { useCallback } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { useEditorStore } from '../store/editorStore';

export function useBackgroundRemoval() {
  const setPortrait = useEditorStore((s) => s.setPortrait);
  const setIsRemoving = useEditorStore((s) => s.setIsRemoving);
  const setRemoveProgress = useEditorStore((s) => s.setRemoveProgress);

  const remove = useCallback(
    async (imageBlob: Blob) => {
      setIsRemoving(true);
      setRemoveProgress(0);

      try {
        const result = await removeBackground(imageBlob, {
          progress: (key, current, total) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              if (key === 'fetch:model') {
                setRemoveProgress(Math.round(pct * 0.3));
              } else if (key === 'compute:inference') {
                setRemoveProgress(30 + Math.round(pct * 0.7));
              }
            }
          },
          output: { format: 'image/png' },
        });

        setPortrait(result);
      } catch (err) {
        console.error('Background removal failed:', err);
        setIsRemoving(false);
        setRemoveProgress(0);
      }
    },
    [setPortrait, setIsRemoving, setRemoveProgress]
  );

  return { remove };
}
