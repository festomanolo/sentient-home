import { registerPlugin } from '@capacitor/core';

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack?: string;
  artist?: string;
  duration?: number;
  position?: number;

// [NOX-DEV-51]: ongoing module refinement
