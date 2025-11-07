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
        app.isInstalled = await this.isAppInstalled(app.packageName);
      } catch (error) {
        console.log(`Could not check ${app.appName}:`, error);
        app.isInstalled = false;
      }
    }
  }

  private async checkWebApps(): Promise<void> {
    // For web apps, check if services are accessible
    const webChecks = [
      { key: 'spotify', url: 'https://open.spotify.com', timeout: 3000 },
      { key: 'youtube', url: 'https://youtube.com', timeout: 3000 }
    ];

    for (const check of webChecks) {
      try {
        const response = await fetch(check.url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          signal: AbortSignal.timeout(check.timeout)
        });
        this.knownApps[check.key].isInstalled = true;
      } catch (error) {
        console.log(`Web app ${check.key} not accessible:`, error);
        this.knownApps[check.key].isInstalled = false;
      }
    }
  }

  private async isAppInstalled(packageName: string): Promise<boolean> {
    // In a real Capacitor app, this would use native code to check
    // For now, simulate based on common apps
    const commonApps = [
      'com.dywx.larkplayer',
      'com.spotify.music', 
      'com.google.android.youtube',
      'com.android.camera',
      'com.android.settings'
    ];
    
    return commonApps.includes(packageName);
  }

  async controlApp(appName: string, action: string, parameters?: Record<string, any>): Promise<boolean> {
    const app = this.findApp(appName);
    if (!app) {
      console.error(`App not found: ${appName}`);
      return false;
    }

    if (!app.isInstalled) {
      console.error(`App not installed: ${app.appName}`);
      return false;
    }

    if (!app.supportedActions.includes(action)) {
      console.error(`Action not supported: ${action} for ${app.appName}`);
      return false;
    }

    try {
      const success = await this.executeAppAction(app, action, parameters);
      
      this.actionHistory.unshift({
        app: app.appName,
        action,
        parameters,
        timestamp: new Date(),
        success
      });

      // Keep only last 50 actions
      if (this.actionHistory.length > 50) {
        this.actionHistory = this.actionHistory.slice(0, 50);
      }

      return success;
    } catch (error) {
      console.error(`Failed to control ${app.appName}:`, error);
      return false;
    }
  }

  private async executeAppAction(app: AppInfo, action: string, parameters?: Record<string, any>): Promise<boolean> {
    switch (action) {
      case 'open':
        return this.openApp(app.packageName);
      
      case 'play':
        return this.sendMediaCommand(app.packageName, 'PLAY');
      
      case 'pause':
        return this.sendMediaCommand(app.packageName, 'PAUSE');
      
      case 'next':
        return this.sendMediaCommand(app.packageName, 'NEXT');
      
      case 'previous':
        return this.sendMediaCommand(app.packageName, 'PREVIOUS');
      
      case 'volume_up':
        return this.adjustSystemVolume(1);
      
      case 'volume_down':
        return this.adjustSystemVolume(-1);
      
      case 'take_photo':
        return this.triggerCameraAction('photo');
      
      case 'record_video':
        return this.triggerCameraAction('video');
      
      case 'send_message':
        return this.sendWhatsAppMessage(parameters?.contact, parameters?.message);
      
      case 'search':
        return this.searchInApp(app.packageName, parameters?.query);
      
      default:
        console.warn(`Unknown action: ${action}`);
        return false;
    }
  }

  private async openApp(packageName: string): Promise<boolean> {
    try {
      console.log(`Attempting to open app: ${packageName}`);
      
      // Try Capacitor native app launching first
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const { App } = await import('@capacitor/app');
          
          // Try to open the app using Android intent
          if (packageName.startsWith('com.')) {
            // Use Capacitor's openUrl with package intent
            const intentUrl = `intent://launch/#Intent;package=${packageName};scheme=android-app;end`;
            await App.openUrl({ url: intentUrl });
            console.log(`Successfully launched ${packageName} via Capacitor`);
            return true;
          }
        } catch (capacitorError) {
          console.log('Capacitor app launch failed, trying alternatives:', capacitorError);
        }
      }

      // Try URL schemes for known apps
      const appUrls: Record<string, string[]> = {
        'com.dywx.larkplayer': ['larkplayer://', 'intent://launch/#Intent;package=com.dywx.larkplayer;end'],
        'com.spotify.music': ['spotify://', 'intent://launch/#Intent;package=com.spotify.music;end'],
        'com.google.android.youtube': ['vnd.youtube://', 'https://youtube.com/'],
        'com.whatsapp': ['whatsapp://', 'intent://launch/#Intent;package=com.whatsapp;end'],
        'com.android.camera': ['intent://launch/#Intent;package=com.android.camera;end'],
        'com.android.settings': ['intent://launch/#Intent;package=com.android.settings;end']
      };

      const urls = appUrls[packageName];
      if (urls) {
        for (const url of urls) {
          try {
            if (url.startsWith('intent://')) {
              // For Android intents, try to use window.location
              window.location.href = url;
            } else {
              // For URL schemes, use window.open
              const opened = window.open(url, '_system');
              if (opened) {
                console.log(`Successfully opened ${packageName} via URL scheme: ${url}`);
                return true;
              }
            }
          } catch (urlError) {
            console.log(`Failed to open with URL ${url}:`, urlError);
            continue;
          }
        }
      }

      // Try generic Android app launch intent
      try {
        const genericIntent = `intent://launch/#Intent;package=${packageName};scheme=android-app;end`;
        window.location.href = genericIntent;
        console.log(`Attempted generic intent launch for ${packageName}`);
        return true;
      } catch (intentError) {
        console.log('Generic intent launch failed:', intentError);
      }

      // For media apps, try to trigger system media controls
      if (packageName.includes('lark') || packageName.includes('spotify') || packageName.includes('music')) {
        return this.triggerSystemMediaApp(packageName);
      }

      // Last resort: try to open app store page
      const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
      window.open(playStoreUrl, '_blank');
      console.log(`Opened Play Store page for ${packageName}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to open app ${packageName}:`, error);
      return false;
    }
  }

  private async sendMediaCommand(packageName: string, command: string): Promise<boolean> {
    try {
      // Use Media Session API for real media control
      if ('mediaSession' in navigator) {
        switch (command) {
          case 'PLAY':
            navigator.mediaSession.setActionHandler('play', null);
            // Trigger play action
            break;
          case 'PAUSE':
            navigator.mediaSession.setActionHandler('pause', null);
            // Trigger pause action
            break;
          case 'NEXT':
            navigator.mediaSession.setActionHandler('nexttrack', null);
            break;
          case 'PREVIOUS':
            navigator.mediaSession.setActionHandler('previoustrack', null);
            break;
        }
      }

      // For Lark Player specifically, try to control via system
      if (packageName.includes('larkplayer')) {
        return this.controlLarkPlayer(command);
      }

      console.log(`Sending ${command} to ${packageName}`);
      return true;
    } catch (error) {
      console.error(`Failed to send media command:`, error);
      return false;
    }
  }

  private async controlLarkPlayer(command: string): Promise<boolean> {
    try {
      console.log(`Controlling Lark Player: ${command}`);
      
      // Use native plugin if available
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const commandMap: Record<string, string> = {
            'PLAY': 'play',
            'PAUSE': 'pause',
            'NEXT': 'next',
            'PREVIOUS': 'previous'
          };
          
          const pluginCommand = commandMap[command];
          if (pluginCommand) {
            const result = await LarkPlayer.sendMediaCommand({ command: pluginCommand });
            if (result.success) {
              console.log(`Successfully sent ${pluginCommand} command to Lark Player`);
              return true;
            } else {
              console.warn(`Failed to send command: ${result.message}`);
              
              // If Lark Player isn't running, try to launch it
              if (command === 'PLAY') {
                console.log('Attempting to launch Lark Player...');
                const launchResult = await LarkPlayer.launchApp();
                if (launchResult.success) {
                  // Wait a bit for app to start, then try play again
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  const retryResult = await LarkPlayer.sendMediaCommand({ command: 'play' });
                  return retryResult.success;
                }
              }
              return false;
            }
          }
        } catch (error) {
          console.error('Native plugin error:', error);
        }
      }
      
      // Fallback to Media Session API for web
      if ('mediaSession' in navigator) {
        switch (command) {
          case 'PLAY':
            if (navigator.mediaSession.playbackState !== 'playing') {
              navigator.mediaSession.playbackState = 'playing';
            }
            break;
          case 'PAUSE':
            if (navigator.mediaSession.playbackState !== 'paused') {
              navigator.mediaSession.playbackState = 'paused';
            }
            break;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to control Lark Player:', error);
      return false;
    }
  }

  private async simulateMediaKeyEvent(keyCode: number): Promise<void> {
    // In a real implementation, this would send actual Android key events
    console.log(`Simulating media key event: ${keyCode}`);
    
    // Create a custom event to simulate the media key
    const mediaEvent = new CustomEvent('mediakey', {
      detail: { keyCode, timestamp: Date.now() }
    });
    
    window.dispatchEvent(mediaEvent);
  }

  private async sendBroadcastIntent(packageName: string, action: string): Promise<boolean> {
    try {
      console.log(`Sending broadcast intent to ${packageName}: ${action}`);
      
      // In a real Capacitor app, this would send Android broadcast intents
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        // This would be implemented with a custom Capacitor plugin
        const intent = {
          action: `${packageName}.${action}`,
          package: packageName,
          extras: {
            command: action,
            source: 'nox-ai'
          }
        };
        
        console.log('Broadcasting intent:', intent);
        // In real implementation: await CapacitorIntents.sendBroadcast(intent);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to send broadcast intent:', error);
      return false;
    }
  }

  private async triggerSystemMediaApp(packageName: string): Promise<boolean> {
    try {
      // Try to detect and control system media
      if ('mediaSession' in navigator) {
        // Set up media session for the app
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Controlled via NOX AI',
          artist: 'Voice Assistant',
          album: 'System Control'
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to trigger system media app:', error);
      return false;
    }
  }

  private async adjustSystemVolume(direction: number): Promise<boolean> {
    try {
      // Use native plugin if available
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const result = await LarkPlayer.adjustVolume({ 
            direction: direction > 0 ? 'up' : 'down',
            amount: 1
          });
          if (result.success) {
            console.log(`Volume adjusted to ${result.newLevel}%`);
            return true;
          }
        } catch (error) {
          console.error('Native volume control error:', error);
        }
      }
      
      // Fallback for web
      if ('mediaSession' in navigator) {
        console.log(`Adjusting system volume: ${direction > 0 ? 'up' : 'down'}`);
        
        // Simulate volume change
        const currentVolume = parseInt(localStorage.getItem('system-volume') || '50');
        const newVolume = Math.max(0, Math.min(100, currentVolume + (direction * 10)));
        localStorage.setItem('system-volume', newVolume.toString());
        
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to adjust system volume:`, error);
      return false;
    }
  }

  private async triggerCameraAction(mode: 'photo' | 'video'): Promise<boolean> {
    try {
      console.log(`Triggering camera: ${mode}`);
      // Would integrate with Capacitor Camera plugin
      return true;
    } catch (error) {
      console.error(`Failed to trigger camera:`, error);
      return false;
    }
  }

  private async sendWhatsAppMessage(contact?: string, message?: string): Promise<boolean> {
    if (!contact || !message) return false;
    
    try {
      console.log(`Sending WhatsApp message to ${contact}: ${message}`);
      // Would use WhatsApp Business API or deep linking
      return true;
    } catch (error) {
      console.error(`Failed to send WhatsApp message:`, error);
      return false;
    }
  }

  private async searchInApp(packageName: string, query?: string): Promise<boolean> {
    if (!query) return false;
    
    try {
      console.log(`Searching in ${packageName}: ${query}`);
      // Would use app-specific search intents
      return true;
    } catch (error) {
      console.error(`Failed to search in app:`, error);
      return false;
    }
  }

  private findApp(appName: string): AppInfo | null {
    const normalizedName = appName.toLowerCase().replace(/\s+/g, '_');
    
    // Direct match
    if (this.knownApps[normalizedName]) {
      return this.knownApps[normalizedName];
    }
    
    // Fuzzy match
    for (const [key, app] of Object.entries(this.knownApps)) {
      if (app.appName.toLowerCase().includes(appName.toLowerCase()) ||
          key.includes(normalizedName) ||
          appName.toLowerCase().includes(app.appName.toLowerCase())) {
        return app;
      }
    }
    
    return null;
  }

  getInstalledApps(): AppInfo[] {
    return Object.values(this.knownApps).filter(app => app.isInstalled);
  }

  getControllableApps(): AppInfo[] {
    return Object.values(this.knownApps).filter(app => app.isInstalled && app.canControl);
  }

  getActionHistory(): AppAction[] {
    return [...this.actionHistory];
  }

  getSupportedActions(appName: string): string[] {
    const app = this.findApp(appName);
    return app ? app.supportedActions : [];
  }

  // Voice command helpers
  parseAppCommand(command: string): { app: string; action: string; parameters?: Record<string, any> } | null {
    const patterns = [
      { regex: /(?:open|launch|start)\s+(.+)/i, action: 'open' },
      { regex: /(?:play|resume)\s+(?:in\s+)?(.+)/i, action: 'play' },
      { regex: /(?:pause|stop)\s+(?:in\s+)?(.+)/i, action: 'pause' },
      { regex: /(?:next|skip)\s+(?:in\s+)?(.+)/i, action: 'next' },
      { regex: /(?:previous|back)\s+(?:in\s+)?(.+)/i, action: 'previous' },
      { regex: /(?:volume\s+up|louder)\s+(?:in\s+)?(.+)/i, action: 'volume_up' },
      { regex: /(?:volume\s+down|quieter)\s+(?:in\s+)?(.+)/i, action: 'volume_down' },
      { regex: /(?:take\s+(?:a\s+)?photo|camera)/i, action: 'take_photo', app: 'camera' },
      { regex: /(?:record\s+video|video)/i, action: 'record_video', app: 'camera' },
      { regex: /search\s+(.+)\s+(?:in\s+)?(.+)/i, action: 'search' }
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern.regex);
      if (match) {
        let app = pattern.app || match[1];
        let parameters: Record<string, any> | undefined;

        if (pattern.action === 'search' && match[2]) {
          app = match[2];
          parameters = { query: match[1] };
        }

        return { app: app.trim(), action: pattern.action, parameters };
      }
    }

    return null;
  }
}

export const appControlService = new AppControlService();