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
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
  }

  private analyzeAudio() {
    if (!this.isActive || !this.analyser || !this.dataArray) return;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length);
    
    // Add to buffer
    this.soundBuffer.push(volume);
    if (this.soundBuffer.length > this.BUFFER_SIZE) {
      this.soundBuffer.shift();
    }
    
    // Detect sound patterns
    this.detectSoundPatterns(volume, this.dataArray);
    
    this.animationFrame = requestAnimationFrame(() => this.analyzeAudio());
  }

  private detectSoundPatterns(volume: number, frequencyData: Uint8Array) {
    const now = Date.now();
    
    // Skip if too soon after last detection (prevent spam)
    if (now - this.lastSoundTime < 1000) return;
    
    // Check if volume exceeds threshold
    if (volume < this.settings.noiseThreshold) {
      // Detect silence periods
      if (this.soundBuffer.length > 10 && this.soundBuffer.every(v => v < this.settings.noiseThreshold)) {
        if (now - this.lastSoundTime > 5000) { // 5 seconds of silence
          this.lastSoundTime = now;
          this.notifyListeners({
            id: Date.now().toString(),
            type: "silence",
            timestamp: new Date(),
            confidence: 0.9,
            volume: Math.round(volume),
            action: "Environment is quiet"
          });
        }
      }
      return;
    }
    
    // Analyze frequency patterns with more precision
    const lowFreq = this.getFrequencyRange(frequencyData, 20, 250);    // Bass/low sounds
    const midLowFreq = this.getFrequencyRange(frequencyData, 250, 500); // Lower mids
    const midFreq = this.getFrequencyRange(frequencyData, 500, 2000);   // Mid frequencies (voice)
    const midHighFreq = this.getFrequencyRange(frequencyData, 2000, 4000); // Upper mids
    const highFreq = this.getFrequencyRange(frequencyData, 4000, 8000);    // High frequencies
    
    let detectedType: SoundType | null = null;
    let confidence = 0;
    
    // Calculate additional metrics
    const variation = this.calculateVariation();
    const sharpness = this.calculateSharpness();
    const consistency = this.calculateConsistency();
    const totalEnergy = lowFreq + midLowFreq + midFreq + midHighFreq + highFreq;
    
    console.log(`Audio Analysis - Volume: ${volume.toFixed(1)}, Low: ${lowFreq.toFixed(1)}, Mid: ${midFreq.toFixed(1)}, High: ${highFreq.toFixed(1)}, Variation: ${variation.toFixed(2)}`);
    
    // Voice detection (human speech patterns)
    if (this.settings.enableVoiceDetection && 
        midFreq > 35 && midHighFreq > 25 && 
        variation > 0.2 && totalEnergy > 100) {
      
      // Check for speech-like patterns
      const speechRatio = (midFreq + midHighFreq) / (lowFreq + highFreq + 1);
      if (speechRatio > 1.2) {
        detectedType = "voice";
        confidence = Math.min(0.95, speechRatio * 0.3 + variation * 0.5);
      }
    }
    
    // Knock detection (sharp, brief, low-frequency dominant)
    else if (this.settings.enableKnockDetection && 
             lowFreq > 50 && midLowFreq > 40 && 
             sharpness > 0.6 && variation < 0.5) {
      
      detectedType = "door_knock";
      confidence = Math.min(0.98, sharpness * 0.7 + (lowFreq / 100) * 0.3);
    }
    
    // Phone ring detection (consistent, high-pitched, repetitive)
    else if (this.settings.enablePhoneDetection && 
             highFreq > 60 && midHighFreq > 50 && 
             consistency > 0.5 && variation < 0.3) {
      
      detectedType = "phone_ring";
      confidence = Math.min(0.9, consistency * 0.6 + (highFreq / 100) * 0.4);
    }
    
    // Music detection (balanced across frequencies, moderate variation)
    else if (lowFreq > 25 && midFreq > 25 && highFreq > 15 && 
             variation > 0.1 && variation < 0.8 && totalEnergy > 80) {
      
      const balance = 1 - Math.abs((lowFreq - midFreq) / (lowFreq + midFreq + 1));
      if (balance > 0.6) {
        detectedType = "music";
        confidence = Math.min(0.8, balance * 0.5 + variation * 0.3);
      }
    }
    
    // TV/appliance detection (consistent low-mid frequencies)
    else if (lowFreq > 35 && midLowFreq > 30 && 
             consistency > 0.4 && variation < 0.4) {
      
      detectedType = "appliance";
      confidence = Math.min(0.7, consistency * 0.5 + (lowFreq / 100) * 0.3);

// [NOX-DEV-63]: ongoing module refinement
