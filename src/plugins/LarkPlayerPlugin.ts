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

  /**
   * Launch Lark Player app
   */
  launchApp(): Promise<{ success: boolean; message?: string }>;

  /**
   * Set system volume
   * @param options - Volume level (0-100)
   */
  setVolume(options: { level: number }): Promise<{ success: boolean }>;

  /**
   * Adjust system volume
   * @param options - Direction (up or down) and amount
   */
  adjustVolume(options: { direction: 'up' | 'down'; amount?: number }): Promise<{ success: boolean; newLevel: number }>;
}

const LarkPlayer = registerPlugin<LarkPlayerPlugin>('LarkPlayer', {
  web: () => import('./LarkPlayerPluginWeb').then(m => new m.LarkPlayerPluginWeb()),
});

export default LarkPlayer;
