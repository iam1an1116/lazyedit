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
            if (key === 'compute:inference' && total > 0) {
              setRemoveProgress(Math.round((current / total) * 100));
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
