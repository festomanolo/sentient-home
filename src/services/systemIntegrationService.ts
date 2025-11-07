import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

export interface SystemInfo {
  platform: string;
  version: string;
  model: string;
  batteryLevel?: number;
  isCharging?: boolean;
  networkStatus: 'online' | 'offline';
  permissions: {
    microphone: boolean;
    location: boolean;
    camera: boolean;
    notifications: boolean;
  };
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  version?: string;
  isSystemApp: boolean;
}

class SystemIntegrationService {
  private systemInfo: SystemInfo | null = null;
  private installedApps: InstalledApp[] = [];

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      console.log('Getting system information...');
      
      let deviceInfo: any = {};
      let batteryInfo: any = {};
      
      // Try to get device info using Capacitor
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          deviceInfo = await Device.getInfo();
          batteryInfo = await Device.getBatteryInfo();
          console.log('Device info from Capacitor:', deviceInfo);
        } catch (capacitorError) {
          console.log('Capacitor device info failed:', capacitorError);
        }
      }
      
      // Get permissions status
      const permissions = await this.checkPermissions();
      
      this.systemInfo = {
        platform: deviceInfo.platform || this.detectPlatform(),
        version: deviceInfo.osVersion || navigator.userAgent,
        model: deviceInfo.model || 'Unknown Device',
        batteryLevel: batteryInfo.batteryLevel ? Math.round(batteryInfo.batteryLevel * 100) : undefined,
        isCharging: batteryInfo.isCharging,
        networkStatus: navigator.onLine ? 'online' : 'offline',
        permissions
      };
      
      console.log('System info collected:', this.systemInfo);
      return this.systemInfo;
      
    } catch (error) {
      console.error('Failed to get system info:', error);
      
      // Fallback system info
      return {
        platform: this.detectPlatform(),
        version: 'Unknown',
        model: 'Unknown Device',
        networkStatus: navigator.onLine ? 'online' : 'offline',
        permissions: {
          microphone: false,
          location: false,
          camera: false,
          notifications: false
        }
      };
    }
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';
    
    return 'web';
  }

  private async checkPermissions(): Promise<SystemInfo['permissions']> {
    const permissions = {
      microphone: false,
      location: false,
      camera: false,
      notifications: false
    };

    try {
      // Check microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        permissions.microphone = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (micError) {
        console.log('Microphone permission check failed:', micError);
      }

      // Check location permission
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        permissions.location = true;
      } catch (locError) {
        console.log('Location permission check failed:', locError);
      }

      // Check camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        permissions.camera = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (camError) {
        console.log('Camera permission check failed:', camError);
      }

      // Check notification permission
      if ('Notification' in window) {
        permissions.notifications = Notification.permission === 'granted';
      }

    } catch (error) {
      console.error('Permission check failed:', error);
    }

    return permissions;
  }

  async getInstalledApps(): Promise<InstalledApp[]> {
    try {
      console.log('Getting installed apps...');
      
      // Try to get installed apps using Capacitor (Android only)
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          // This would require a custom Capacitor plugin
          // For now, we'll return a list of commonly installed apps
          this.installedApps = await this.getCommonAndroidApps();
        } catch (error) {
          console.log('Native app list failed:', error);
          this.installedApps = this.getWebApps();
        }
      } else {
        // For web, return web-based apps
        this.installedApps = this.getWebApps();
      }
      
      console.log(`Found ${this.installedApps.length} apps`);
      return this.installedApps;
      
    } catch (error) {
      console.error('Failed to get installed apps:', error);
      return [];
    }
  }

  private async getCommonAndroidApps(): Promise<InstalledApp[]> {
    // Simulate checking for common Android apps
    const commonApps = [
      { packageName: 'com.dywx.larkplayer', appName: 'Lark Player', isSystemApp: false },
      { packageName: 'com.spotify.music', appName: 'Spotify', isSystemApp: false },
      { packageName: 'com.google.android.youtube', appName: 'YouTube', isSystemApp: false },
      { packageName: 'com.whatsapp', appName: 'WhatsApp', isSystemApp: false },
      { packageName: 'com.android.camera', appName: 'Camera', isSystemApp: true },
      { packageName: 'com.android.settings', appName: 'Settings', isSystemApp: true },
      { packageName: 'com.android.chrome', appName: 'Chrome', isSystemApp: true },
      { packageName: 'com.google.android.gm', appName: 'Gmail', isSystemApp: false }
    ];

    // In a real implementation, this would check which apps are actually installed
    return commonApps;
  }

  private getWebApps(): InstalledApp[] {
    return [
      { packageName: 'web.youtube', appName: 'YouTube', isSystemApp: false },
      { packageName: 'web.spotify', appName: 'Spotify Web', isSystemApp: false },
      { packageName: 'web.gmail', appName: 'Gmail', isSystemApp: false },
      { packageName: 'web.maps', appName: 'Google Maps', isSystemApp: false }
    ];
  }

  async launchApp(packageName: string): Promise<boolean> {
    try {
      console.log(`Launching app: ${packageName}`);
      
      // Try Capacitor App plugin first
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          if (packageName.startsWith('com.')) {
            // Android package name
            const intentUrl = `intent://launch/#Intent;package=${packageName};scheme=android-app;end`;
            await App.openUrl({ url: intentUrl });
            return true;
          }
        } catch (capacitorError) {
          console.log('Capacitor app launch failed:', capacitorError);
        }
      }

      // Fallback to web URLs
      const webUrls: Record<string, string> = {
        'web.youtube': 'https://youtube.com',
        'web.spotify': 'https://open.spotify.com',
        'web.gmail': 'https://gmail.com',
        'web.maps': 'https://maps.google.com',
        'com.google.android.youtube': 'https://youtube.com',
        'com.spotify.music': 'https://open.spotify.com'
      };

      const url = webUrls[packageName];
      if (url) {
        window.open(url, '_blank');
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to launch app ${packageName}:`, error);
      return false;
    }
  }

  async requestPermission(permission: keyof SystemInfo['permissions']): Promise<boolean> {
    try {
      console.log(`Requesting ${permission} permission...`);
      
      switch (permission) {
        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
          } catch (error) {
            return false;
          }

        case 'camera':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
          } catch (error) {
            return false;
          }

        case 'location':
          try {
            await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            return true;
          } catch (error) {
            return false;
          }

        case 'notifications':
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
          }
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to request ${permission} permission:`, error);
      return false;
    }
  }

  async getNetworkInfo(): Promise<{ type: string; speed?: string; isOnline: boolean }> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      type: connection?.effectiveType || 'unknown',
      speed: connection?.downlink ? `${connection.downlink} Mbps` : undefined,
      isOnline: navigator.onLine
    };
  }

  async getBatteryInfo(): Promise<{ level?: number; charging?: boolean; chargingTime?: number }> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime
        };
      }
    } catch (error) {
      console.log('Battery API not available:', error);
    }
    
    return {};
  }
}

export const systemIntegrationService = new SystemIntegrationService();