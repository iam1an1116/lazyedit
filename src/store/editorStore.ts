import { create } from 'zustand';
import type { CanvasElement, StrokeStyle, PortraitFilter } from '../types';

interface EditorState {
  originalImage: HTMLImageElement | null;
  originalImageUrl: string | null;
  imageDimensions: { width: number; height: number } | null;

  portraitBlob: Blob | null;
  portraitUrl: string | null;
  isRemoving: boolean;
  removeProgress: number;

  elements: CanvasElement[];
  selectedElementId: string | null;

  strokeStyle: StrokeStyle;
  strokeWidth: number;
  strokeColor: string;

  portraitFilter: PortraitFilter;

  activeTab: 'upload' | 'layers' | 'stroke' | 'filter';

  setImage: (img: HTMLImageElement, url: string) => void;
  clearImage: () => void;
  setPortrait: (blob: Blob) => void;
  clearPortrait: () => void;
  setIsRemoving: (v: boolean) => void;
  setRemoveProgress: (v: number) => void;

  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;

  setStrokeStyle: (s: StrokeStyle) => void;
  setStrokeWidth: (w: number) => void;
  setStrokeColor: (c: string) => void;

  setPortraitFilter: (f: PortraitFilter) => void;
  setActiveTab: (t: 'upload' | 'layers' | 'stroke' | 'filter') => void;

  resetEdits: () => void;
  resetAll: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  originalImage: null,
  originalImageUrl: null,
  imageDimensions: null,

  portraitBlob: null,
  portraitUrl: null,
  isRemoving: false,
  removeProgress: 0,

  elements: [],
  selectedElementId: null,

  strokeStyle: 'none',
  strokeWidth: 12,
  strokeColor: '#FF4500',

  portraitFilter: 'normal',

  activeTab: 'upload',

  setImage: (img, url) =>
    set({
      originalImage: img,
      originalImageUrl: url,
      imageDimensions: { width: img.naturalWidth, height: img.naturalHeight },
      portraitBlob: null,
      portraitUrl: null,
      elements: [],
      selectedElementId: null,
      strokeStyle: 'none',
      portraitFilter: 'normal',
    }),

  clearImage: () =>
    set({
      originalImage: null,
      originalImageUrl: null,
      imageDimensions: null,
      portraitBlob: null,
      portraitUrl: null,
      elements: [],
      selectedElementId: null,
      isRemoving: false,
      removeProgress: 0,
    }),

  setPortrait: (blob) => {
    const prev = useEditorStore.getState().portraitUrl;
    if (prev) URL.revokeObjectURL(prev);
    const url = URL.createObjectURL(blob);
    set({ portraitBlob: blob, portraitUrl: url, isRemoving: false, removeProgress: 100 });
  },

  clearPortrait: () => {
    const prev = useEditorStore.getState().portraitUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ portraitBlob: null, portraitUrl: null });
  },

  setIsRemoving: (v) => set({ isRemoving: v }),
  setRemoveProgress: (v) => set({ removeProgress: v }),

  addElement: (el) => set((s) => ({ elements: [...s.elements, el] })),

  updateElement: (id, updates) =>
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } as CanvasElement : el)),
    })),

  removeElement: (id) =>
    set((s) => ({
      elements: s.elements.filter((el) => el.id !== id),
      selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
    })),

  selectElement: (id) => set({ selectedElementId: id }),

  setStrokeStyle: (s) => set({ strokeStyle: s }),
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  setStrokeColor: (c) => set({ strokeColor: c }),

  setPortraitFilter: (f) => set({ portraitFilter: f }),
  setActiveTab: (t) => set({ activeTab: t }),

  resetEdits: () =>
    set({
      elements: [],
      selectedElementId: null,
      strokeStyle: 'none',
      strokeWidth: 12,
      strokeColor: '#FF4500',
      portraitFilter: 'normal',
    }),

  resetAll: () => {
    const prev = useEditorStore.getState().portraitUrl;
    if (prev) URL.revokeObjectURL(prev);
    const prevImg = useEditorStore.getState().originalImageUrl;
    if (prevImg) URL.revokeObjectURL(prevImg);
    set({
      originalImage: null,
      originalImageUrl: null,
      imageDimensions: null,
      portraitBlob: null,
      portraitUrl: null,
      isRemoving: false,
      removeProgress: 0,
      elements: [],
      selectedElementId: null,
      strokeStyle: 'none',
      strokeWidth: 12,
      strokeColor: '#FF4500',
      portraitFilter: 'normal',
      activeTab: 'upload',
    });
  },
}));
