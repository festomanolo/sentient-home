import { registerPlugin } from '@capacitor/core';

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack?: string;
  artist?: string;
  duration?: number;
  position?: number;
}

export interface LarkPlayerPlugin {
  /**
   * Check if Lark Player is installed on the device
   */
  checkInstalled(): Promise<{ installed: boolean }>;


// [NOX-DEV-51]: ongoing module refinement
