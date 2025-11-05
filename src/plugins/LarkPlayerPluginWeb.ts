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


// [NOX-DEV-52]: ongoing module refinement
