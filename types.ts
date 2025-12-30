
export enum GridType {
  CUSTOM = 'CUSTOM'
}

export interface GridConfig {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ProcessingSettings {
  gridType: GridType;
  canvasWidth: number;
  canvasHeight: number;
  customPadding: GridConfig;
}

export interface StandardizedImage {
  id: string;
  name: string;
  originalSrc: string;
  processedSrc: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  width: number;
  height: number;
}

export const GRID_PRESETS: Record<GridType, GridConfig> = {
  [GridType.CUSTOM]: { top: 150, bottom: 150, left: 150, right: 150 },
};
