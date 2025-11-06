export type SoundType = "door_knock" | "phone_ring" | "voice" | "silence" | "music" | "tv" | "appliance" | "alarm";

export interface SoundEvent {
  id: string;
  type: SoundType;
  timestamp: Date;
  confidence: number;
  action?: string;
  volume: number;
  frequency?: number;
}

export interface AudioSettings {
  sensitivity: number;
  noiseThreshold: number;
  enableVoiceDetection: boolean;
  enableKnockDetection: boolean;
  enablePhoneDetection: boolean;
}

class SoundDetectionService {
  private listeners: ((event: SoundEvent) => void)[] = [];
  private isActive = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  
  private settings: AudioSettings = {
    sensitivity: 0.7,
    noiseThreshold: 30,
    enableVoiceDetection: true,
    enableKnockDetection: true,
    enablePhoneDetection: true
  };

  private lastSoundTime = 0;
  private soundBuffer: number[] = [];
  private readonly BUFFER_SIZE = 50;

  async start() {
    if (this.isActive) return;
    
    try {
      console.log('Requesting microphone access...');
      
      // Request microphone access with specific constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // We want to detect all sounds
          autoGainControl: false,  // We want raw audio levels
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      console.log('Microphone access granted, creating audio context...');
      
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3; // More responsive
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isActive = true;
      
      // Start audio analysis
      this.analyzeAudio();
      
      console.log('Real-time sound detection started successfully');
      console.log(`Audio context sample rate: ${this.audioContext.sampleRate}Hz`);
      console.log(`Analyser frequency bins: ${this.analyser.frequencyBinCount}`);
      
      // Notify listeners that detection started
      this.notifyListeners({
        id: Date.now().toString(),
        type: "silence",
        timestamp: new Date(),
        confidence: 1.0,
        volume: 0,
        action: "Sound detection started"
      });
      
    } catch (error) {
      console.error('Failed to access microphone:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.error('Microphone permission denied by user');
          throw new Error('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          console.error('No microphone found');
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotSupportedError') {
          console.error('Microphone not supported');
          throw new Error('Microphone not supported by this browser.');
        }
      }
      
      throw new Error(`Failed to start sound detection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  stop() {
    this.isActive = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());

// [NOX-DEV-63]: ongoing module refinement
