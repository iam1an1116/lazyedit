export interface TextElement {
  type: 'text';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
  bold: boolean;
  italic: boolean;
}

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star';

export interface ShapeElement {
  type: 'shape';
  shapeType: ShapeType;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderRadius: number;
  opacity: number;
  rotation: number;
}

export type CanvasElement = TextElement | ShapeElement;

export type StrokeStyle = 'none' | 'solid' | 'dots' | 'stripes';
export type PortraitFilter = 'normal' | 'silhouette' | 'bw' | 'glitch';

export interface Point {
  x: number;
  y: number;
}
