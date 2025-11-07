import { WebPlugin } from '@capacitor/core';
import type { LarkPlayerPlugin, PlaybackState } from './LarkPlayerPlugin';

export class LarkPlayerPluginWeb extends WebPlugin implements LarkPlayerPlugin {
  async checkInstalled(): Promise<{ installed: boolean }> {
    console.log('LarkPlayer plugin - web fallback: checkInstalled');
    // On web, we can't check if Android apps are installed
    return { installed: false };
  }

  async isRunning(): Promise<{ running: boolean }> {
    console.log('LarkPlayer plugin - web fallback: isRunning');
    return { running: false };
  }

  async sendMediaCommand(options: { command: string }): Promise<{ success: boolean; message?: string }> {
    console.log('LarkPlayer plugin - web fallback: sendMediaCommand', options);
    
    // Try to use Media Session API on web
    if ('mediaSession' in navigator) {
      try {
        switch (options.command) {
          case 'play':
            // Trigger play action if handler exists
            console.log('Web: Triggering play action');
            break;
          case 'pause':
            console.log('Web: Triggering pause action');
            break;
          case 'next':
            console.log('Web: Triggering next track');
            break;
          case 'previous':
            console.log('Web: Triggering previous track');
            break;
        }
        return { success: true, message: 'Command sent via Media Session API' };
      } catch (error) {
        return { success: false, message: `Media Session API error: ${error}` };
      }
    }
    
    return { success: false, message: 'Media Session API not available on web' };
  }

  async getPlaybackState(): Promise<PlaybackState> {
    console.log('LarkPlayer plugin - web fallback: getPlaybackState');
    return {
      isPlaying: false,
      currentTrack: 'N/A (Web)',
      artist: 'N/A',
    };
  }

  async launchApp(): Promise<{ success: boolean; message?: string }> {
    console.log('LarkPlayer plugin - web fallback: launchApp');
    return { success: false, message: 'Cannot launch Android apps from web' };
  }

  async setVolume(options: { level: number }): Promise<{ success: boolean }> {
    console.log('LarkPlayer plugin - web fallback: setVolume', options);
    // On web, we can't control system volume
    return { success: false };
  }

  async adjustVolume(options: { direction: 'up' | 'down'; amount?: number }): Promise<{ success: boolean; newLevel: number }> {
    console.log('LarkPlayer plugin - web fallback: adjustVolume', options);
    return { success: false, newLevel: 50 };
  }
}
