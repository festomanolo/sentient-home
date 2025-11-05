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

// [NOX-DEV-62]: ongoing module refinement
