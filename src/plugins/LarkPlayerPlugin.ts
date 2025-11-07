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

  /**
   * Check if Lark Player is currently running
   */
  isRunning(): Promise<{ running: boolean }>;

  /**
   * Send a media command to Lark Player
   * @param options - Command to send (play, pause, next, previous)
   */
  sendMediaCommand(options: { command: string }): Promise<{ success: boolean; message?: string }>;

  /**
   * Get current playback state from Lark Player
   */
  getPlaybackState(): Promise<PlaybackState>;


// [NOX-DEV-51]: ongoing module refinement
