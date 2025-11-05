import { App } from '@capacitor/app';
import LarkPlayer from '@/plugins/LarkPlayerPlugin';

export interface AppInfo {
  packageName: string;
  appName: string;
  isInstalled: boolean;
  canControl: boolean;
  supportedActions: string[];
}

export interface AppAction {
  app: string;
  action: string;
  parameters?: Record<string, any>;
  timestamp: Date;
  success: boolean;
}

class AppControlService {
  private knownApps: Record<string, AppInfo> = {
    'lark_player': {
      packageName: 'com.dywx.larkplayer',
      appName: 'Lark Player',
      isInstalled: false,
      canControl: true,
      supportedActions: ['play', 'pause', 'next', 'previous', 'volume_up', 'volume_down', 'open']
    },
    'spotify': {
      packageName: 'com.spotify.music',
      appName: 'Spotify',
      isInstalled: false,
      canControl: true,
      supportedActions: ['play', 'pause', 'next', 'previous', 'open']
    },
    'youtube': {
      packageName: 'com.google.android.youtube',
      appName: 'YouTube',
      isInstalled: false,
      canControl: true,
      supportedActions: ['play', 'pause', 'open', 'search']
    },
    'netflix': {
      packageName: 'com.netflix.mediaclient',
      appName: 'Netflix',
      isInstalled: false,
      canControl: true,
      supportedActions: ['open', 'play', 'pause']
    },
    'whatsapp': {
      packageName: 'com.whatsapp',
      appName: 'WhatsApp',
      isInstalled: false,
      canControl: true,
      supportedActions: ['open', 'send_message']
    },
    'camera': {
      packageName: 'com.android.camera',
      appName: 'Camera',
      isInstalled: true,
      canControl: true,
      supportedActions: ['open', 'take_photo', 'record_video']
    },
    'settings': {
      packageName: 'com.android.settings',
      appName: 'Settings',
      isInstalled: true,
      canControl: true,
      supportedActions: ['open', 'wifi', 'bluetooth', 'volume']
    }
  };

  private actionHistory: AppAction[] = [];

  constructor() {
    this.checkInstalledApps();
  }

  async checkInstalledApps(): Promise<void> {
    console.log('Checking installed apps...');
    
    try {
      // Check Lark Player using native plugin
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const result = await LarkPlayer.checkInstalled();
          this.knownApps.lark_player.isInstalled = result.installed;
          console.log('Lark Player installed:', result.installed);
        } catch (error) {
          console.error('Failed to check Lark Player:', error);
          this.knownApps.lark_player.isInstalled = false;
        }
        
        await this.checkRealInstalledApps();
      } else {
        // For web, check which web apps are accessible
        await this.checkWebApps();
      }
      
      // Always mark system apps as installed
      this.knownApps.camera.isInstalled = true;
      this.knownApps.settings.isInstalled = true;
      
      console.log('App check completed. Installed apps:', 
        Object.values(this.knownApps).filter(app => app.isInstalled).map(app => app.appName)
      );
      
    } catch (error) {
      console.error('Failed to check installed apps:', error);
      // Fallback: assume common apps are installed
      this.knownApps.lark_player.isInstalled = true;
      this.knownApps.spotify.isInstalled = true;
      this.knownApps.youtube.isInstalled = true;
      this.knownApps.camera.isInstalled = true;
      this.knownApps.settings.isInstalled = true;
    }
  }

  private async checkRealInstalledApps(): Promise<void> {
    // This would use a native plugin to check installed apps
    // For now, simulate checking by trying to launch apps
    const appsToCheck = Object.keys(this.knownApps);
    
    for (const appKey of appsToCheck) {
      const app = this.knownApps[appKey];
      try {
        // Try to check if app is installed (would use native code)

// [NOX-DEV-53]: ongoing module refinement
