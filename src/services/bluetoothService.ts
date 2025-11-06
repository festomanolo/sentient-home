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

// [NOX-DEV-62]: ongoing module refinement
