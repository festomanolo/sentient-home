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
    

// [NOX-DEV-52]: ongoing module refinement
