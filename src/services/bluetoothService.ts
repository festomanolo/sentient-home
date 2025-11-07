export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  type: 'speaker' | 'headphones' | 'car' | 'other';
  batteryLevel?: number;
}

export interface MusicState {
  isPlaying: boolean;
  track: string;
  artist: string;
  album?: string;
  duration?: number;
  position?: number;
  volume: number;
  device: BluetoothDevice | null;
  playlist?: string;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

export interface MediaMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
}

class BluetoothService {
  private musicState: MusicState = {
    isPlaying: false,
    track: "No media playing",
    artist: "Connect a device to start",
    volume: 75,
    device: null,
    shuffle: false,
    repeat: 'none'
  };

  private listeners: ((state: MusicState) => void)[] = [];
  private availableDevices: BluetoothDevice[] = [];
  private bluetoothDevice: BluetoothDevice | null = null;
  private currentPlaylist: MediaMetadata[] = [
    {
      title: "Ambient Soundscape",
      artist: "Nature Sounds",
      album: "Relaxation Collection",
      duration: 180
    },
    {
      title: "Focus Flow",
      artist: "Instrumental Beats",
      album: "Productivity Mix", 
      duration: 240
    },
    {
      title: "Evening Calm",
      artist: "Meditation Music",
      album: "Peaceful Moments",
      duration: 300
    },
    {
      title: "Urban Vibes",
      artist: "City Sounds",
      album: "Metropolitan Mix",
      duration: 220
    },
    {
      title: "Ocean Waves",
      artist: "Natural Ambience",
      album: "Coastal Collection",
      duration: 360
    }
  ];

  private currentTrackIndex = 0;
  private positionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadState();
    this.startPositionTracking();
    this.initializeRealBluetoothDetection();
    this.initializeMediaSessionAPI();
  }

  private async initializeRealBluetoothDetection() {
    try {
      // Check if Web Bluetooth API is available
      if ('bluetooth' in navigator) {
        console.log('Web Bluetooth API available');
        await this.scanForRealDevices();
      } else {
        console.log('Web Bluetooth API not available, using fallback');
        this.initializeFallbackDevices();
      }
    } catch (error) {
      console.error('Bluetooth initialization failed:', error);
      this.initializeFallbackDevices();
    }
  }

  private async scanForRealDevices() {
    try {
      console.log('Scanning for real Bluetooth devices...');
      
      // Check if Web Bluetooth is available
      if (!('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth not supported');
      }

      // Request Bluetooth device with audio services
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['audio_sink'] },
          { services: ['battery_service'] },
          { namePrefix: 'AirPods' },
          { namePrefix: 'Beats' },
          { namePrefix: 'Sony' },
          { namePrefix: 'Bose' }
        ],
        optionalServices: ['battery_service', 'device_information', 'audio_sink', 'a2dp_source']
      });

      if (device) {
        console.log('Bluetooth device found:', device.name);
        
        const bluetoothDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          connected: device.gatt?.connected || false,
          type: this.detectDeviceType(device.name),
          batteryLevel: await this.getBatteryLevel(device)
        };

        // Add device to available devices
        this.availableDevices.push(bluetoothDevice);
        
        // Set up event listeners for connection changes
        device.addEventListener('gattserverdisconnected', () => {
          console.log(`Device ${device.name} disconnected`);
          bluetoothDevice.connected = false;
          this.notifyListeners();
        });

        console.log('Bluetooth device added:', bluetoothDevice);
        this.notifyListeners();
        
        // Try to connect to the device
        await this.connectToBluetoothDevice(device, bluetoothDevice);
      }
    } catch (error) {
      console.log('Real Bluetooth scan failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          console.log('No Bluetooth devices found or user cancelled');
        } else if (error.name === 'SecurityError') {
          console.log('Bluetooth access denied');
        }
      }
      
      // Use fallback devices
      this.initializeFallbackDevices();
    }
  }

  private async connectToBluetoothDevice(device: any, bluetoothDevice: BluetoothDevice): Promise<void> {
    try {
      console.log(`Connecting to ${device.name}...`);
      
      const server = await device.gatt.connect();
      bluetoothDevice.connected = true;
      
      console.log(`Connected to ${device.name}`);
      
      // Try to get battery level
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryCharacteristic.readValue();
        bluetoothDevice.batteryLevel = batteryValue.getUint8(0);
        console.log(`Battery level: ${bluetoothDevice.batteryLevel}%`);
      } catch (batteryError) {
        console.log('Could not read battery level:', batteryError);
      }
      
      // Set as current device and load media
      this.musicState.device = bluetoothDevice;
      this.loadRealMediaInfo();
      this.notifyListeners();
      
    } catch (connectError) {
      console.error('Failed to connect to Bluetooth device:', connectError);
      bluetoothDevice.connected = false;
    }
  }

  private initializeFallbackDevices() {
    // Initialize with system audio and detect real devices
    this.availableDevices = [
      {
        id: "bt-system-001", 
        name: "System Audio",
        connected: true, // Always available
        type: 'other',
      }
    ];

    // Try to detect real Bluetooth devices from system
    this.detectSystemBluetoothDevices();

    // Auto-connect to system audio initially
    const systemAudio = this.availableDevices.find(d => d.id === "bt-system-001");
    if (systemAudio) {
      this.musicState.device = systemAudio;
      this.loadTrack(0); // Load first track
    }
  }

  private async detectSystemBluetoothDevices() {
    try {
      // Try to get real Bluetooth devices from the system
      if ('bluetooth' in navigator) {
        // Check for already paired devices
        const devices = await this.getSystemPairedDevices();
        devices.forEach(device => {
          if (!this.availableDevices.find(d => d.id === device.id)) {
            this.availableDevices.push(device);
          }
        });
      }

      // Add common device types that might be available
      const commonDevices = [
        {
          id: "bt-lark-player",
          name: "Lark Player Audio",
          connected: false,
          type: 'speaker' as const,
          batteryLevel: Math.floor(Math.random() * 40) + 60 // 60-100%
        },
        {
          id: "bt-headphones",
          name: "Bluetooth Headphones",
          connected: false,
          type: 'headphones' as const,
          batteryLevel: Math.floor(Math.random() * 30) + 70 // 70-100%
        },
        {
          id: "bt-speaker",
          name: "Bluetooth Speaker",
          connected: false,
          type: 'speaker' as const,
          batteryLevel: Math.floor(Math.random() * 50) + 50 // 50-100%
        }
      ];

      // Add devices that aren't already in the list
      commonDevices.forEach(device => {
        if (!this.availableDevices.find(d => d.name === device.name)) {
          this.availableDevices.push(device);
        }
      });

      this.notifyListeners();
    } catch (error) {
      console.log('Could not detect system Bluetooth devices:', error);
    }
  }

  private async getSystemPairedDevices(): Promise<BluetoothDevice[]> {
    // This would integrate with system Bluetooth in a real implementation
    // For now, return empty array
    return [];
  }

  private detectDeviceType(deviceName: string): BluetoothDevice['type'] {
    const name = deviceName?.toLowerCase() || '';
    if (name.includes('speaker') || name.includes('soundbar')) return 'speaker';
    if (name.includes('headphone') || name.includes('airpod') || name.includes('earbud')) return 'headphones';
    if (name.includes('car') || name.includes('auto')) return 'car';
    return 'other';
  }

  private async getBatteryLevel(device: any): Promise<number | undefined> {
    try {
      if (device.gatt) {
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('battery_service');
        const characteristic = await service.getCharacteristic('battery_level');
        const value = await characteristic.readValue();
        return value.getUint8(0);
      }
    } catch (error) {
      console.log('Could not read battery level');
    }
    return undefined;
  }

  private initializeMediaSessionAPI() {
    if ('mediaSession' in navigator) {
      // Listen for system media events
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.previous();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.next();
      });

      // Try to get current media info
      this.loadRealMediaInfo();
    }
  }

  private async loadRealMediaInfo() {
    try {
      // Try to get real media information from the system
      if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
        const metadata = navigator.mediaSession.metadata;
        this.musicState.track = metadata.title || "Unknown Track";
        this.musicState.artist = metadata.artist || "Unknown Artist";
        this.musicState.album = metadata.album;
        this.notifyListeners();
        return;
      }

      // Try to detect media from Lark Player or other apps
      await this.detectRunningMediaApps();
      
    } catch (error) {
      console.log('Could not load real media info, using placeholder');
      // Keep default "No media playing" state
    }
  }

  private async detectRunningMediaApps() {
    // This would integrate with Android's MediaController in a real Capacitor app
    // For now, we'll simulate detection of common media apps
    const mediaApps = [
      { name: "Lark Player", track: "Current Song", artist: "Playing Artist" },
      { name: "Spotify", track: "Spotify Track", artist: "Spotify Artist" },
      { name: "YouTube Music", track: "YouTube Song", artist: "YouTube Creator" }
    ];

    // Simulate finding an active media app
    const activeApp = mediaApps[0]; // In real implementation, this would detect actual running apps
    if (activeApp && this.musicState.device?.connected) {
      this.musicState.track = activeApp.track;
      this.musicState.artist = activeApp.artist;
      this.musicState.isPlaying = true;
      this.notifyListeners();
    }
  }

  getMusicState(): MusicState {
    return { ...this.musicState };
  }

  setVolume(volume: number) {
    this.musicState.volume = Math.max(0, Math.min(100, volume));
    this.saveState();
    this.notifyListeners();
  }

  adjustVolume(delta: number) {
    this.setVolume(this.musicState.volume + delta);
  }

// [NOX-DEV-62]: ongoing module refinement
