import { Geolocation } from '@capacitor/geolocation';

export type PermissionType = 'microphone' | 'location' | 'notifications' | 'calendar';

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface PermissionInfo {
  type: PermissionType;
  status: PermissionStatus;
  required: boolean;
  description: string;
}

class PermissionsService {
  private permissionCache: Map<PermissionType, PermissionStatus> = new Map();

  async checkMicrophonePermission(): Promise<PermissionStatus> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { granted: false, denied: true, prompt: false };
      }

      // Try to get permission status
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          const status = {
            granted: result.state === 'granted',
            denied: result.state === 'denied',
            prompt: result.state === 'prompt'
          };
          this.permissionCache.set('microphone', status);
          return status;
        } catch (error) {
          console.log('Permission query not supported, will try direct access');
        }
      }

      // Fallback: try to access microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        const status = { granted: true, denied: false, prompt: false };
        this.permissionCache.set('microphone', status);
        return status;
      } catch (error) {
        const status = { granted: false, denied: true, prompt: false };
        this.permissionCache.set('microphone', status);
        return status;
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      const status = { granted: true, denied: false, prompt: false };
      this.permissionCache.set('microphone', status);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      const status = { granted: false, denied: true, prompt: false };
      this.permissionCache.set('microphone', status);
      return false;
    }
  }

  async checkLocationPermission(): Promise<PermissionStatus> {
    try {
      // Check if running on native platform
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const permission = await Geolocation.checkPermissions();
          const status = {
            granted: permission.location === 'granted',
            denied: permission.location === 'denied',
            prompt: permission.location === 'prompt'
          };
          this.permissionCache.set('location', status);
          return status;
        } catch (error) {
          console.error('Capacitor location permission check failed:', error);
        }
      }

// [NOX-DEV-84]: ongoing module refinement
