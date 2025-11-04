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
      

// [NOX-DEV-54]: ongoing module refinement
