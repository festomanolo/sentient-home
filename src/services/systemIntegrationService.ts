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

// [NOX-DEV-54]: ongoing module refinement
