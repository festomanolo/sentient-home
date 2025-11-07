// Using Web Speech API for text-to-speech

export interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: Date;
}

export interface VoiceSettings {
  language: string;
  voiceRate: number;
  voicePitch: number;
  volume: number;
  wakeWord: string;
  continuousListening: boolean;
  voiceResponseEnabled: boolean;
}

export type ListeningState = 'inactive' | 'listening' | 'processing' | 'speaking';

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private commandListeners: ((command: VoiceCommand) => void)[] = [];
  private audioLevelListeners: ((level: number) => void)[] = [];
  private currentState: ListeningState = 'inactive';
  private settings: VoiceSettings = {
    language: 'en-US',
    voiceRate: 1.0,
    voicePitch: 1.0,
    volume: 0.8,
    wakeWord: 'hey nox',
    continuousListening: true,
    voiceResponseEnabled: true
  };

  private greetings = [
    "Welcome back, Manolo! I'm here and ready to help with whatever you need.",
    "Hello Manolo! Great to see you again. How can I make your day better?",
    "Hey there, Manolo! I've been keeping an eye on things while you were away. What can I do for you?",
    "Welcome home, Manolo! I've got your weather, calendar, and everything else ready. Just ask!",
    "Good to have you back, Manolo! I'm all set to help you stay organized and connected.",
    "Hi Manolo! I've been monitoring your home and I'm ready to assist. What would you like to know?",
    "Welcome back! I'm Nox, your personal assistant. I can help with weather, music, apps, and much more."
  ];

  private naturalResponses = {
    weather: [
      "Right now it's {temp} degrees and {condition} in {location}. {additional}",
      "The weather in {location} is {temp} degrees with {condition}. {additional}",
      "It's currently {temp} degrees and {condition} outside. {additional}"
    ],
    time: [
      "It's {time} right now.",
      "The current time is {time}.",
      "Right now it's {time}."
    ],
    calendar: [
      "You have {event} coming up at {time}. {details}",
      "Your next event is {event} at {time}. {details}",
      "Looking at your calendar, you have {event} scheduled for {time}. {details}"
    ],
    music: [
      "I've {action} the music for you.",
      "Done! I've {action} your music.",
      "Music {action}. Anything else I can help with?"
    ],
    app: [
      "I've {action} {app} for you.",
      "Opening {app} now.",
      "{app} is starting up."
    ],
    error: [
      "I'm sorry, I didn't quite catch that. Could you try again?",
      "I'm not sure I understood. Can you rephrase that?",
      "Sorry, I missed that. What did you need help with?",
      "I didn't get that. Could you say it again?"
    ],
    acknowledgment: [
      "You're very welcome! Anything else I can help you with?",
      "My pleasure! Is there anything else you need?",
      "Happy to help! Let me know if you need anything else.",
      "Glad I could help! What else can I do for you?"
    ]
  };

  private conversationalFillers = [
    "Let me check that for you...",
    "One moment please...",
    "I'm looking that up now...",
    "Give me just a second...",
    "Let me see what I can find..."
  ];

  constructor() {
    this.loadSettings();
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition settings
      this.recognition.continuous = this.settings.continuousListening;
      this.recognition.interimResults = true; // Enable interim results for better UX
      this.recognition.lang = this.settings.language;
      this.recognition.maxAlternatives = 3; // Get multiple alternatives
      
      console.log(`Speech recognition initialized with language: ${this.settings.language}`);

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
        this.isListening = true;
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Only process final results
        if (finalTranscript) {
          this.currentState = 'processing';
          
          const command: VoiceCommand = {
            command: finalTranscript.toLowerCase().trim(),
            confidence: event.results[event.results.length - 1][0].confidence || 0.8,
            timestamp: new Date()
          };
          
          console.log(`Voice command recognized: "${command.command}" (confidence: ${command.confidence.toFixed(2)})`);
          this.notifyCommandListeners(command);
          
          // Return to listening state after processing
          setTimeout(() => {
            if (this.isListening) {
              this.currentState = 'listening';
            }
          }, 500);
        }
        
        // Log interim results for debugging
        if (interimTranscript) {
          console.log(`Interim speech: "${interimTranscript}"`);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        
        switch (event.error) {
          case 'no-speech':
            console.log('No speech detected, will retry...');
            if (this.settings.continuousListening) {
              setTimeout(() => this.startListening(), 2000);
            }
            break;
          case 'audio-capture':
            console.error('Audio capture failed - check microphone');
            break;
          case 'not-allowed':
            console.error('Speech recognition not allowed - check permissions');
            break;
          case 'network':
            console.error('Network error during speech recognition');
            if (this.settings.continuousListening) {
              setTimeout(() => this.startListening(), 5000);
            }
            break;
          default:
            console.error(`Speech recognition error: ${event.error}`);
            if (this.settings.continuousListening) {
              setTimeout(() => this.startListening(), 3000);
            }
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.isListening = false;
        
        if (this.settings.continuousListening) {
          // Restart listening in continuous mode with a small delay
          setTimeout(() => {
            if (!this.isListening) { // Only restart if not already listening
              this.startListening();
            }
          }, 1000);
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.currentState = 'listening';
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.currentState = 'inactive';
    }
  }

  getAudioLevel(): number {
    // Get current audio level from sound detection service
    if (typeof window !== 'undefined') {
      try {
        const { soundDetectionService } = require('./soundDetectionService');
        if (soundDetectionService.isRunning()) {
          return soundDetectionService.getCurrentVolume();
        }
      } catch (error) {
        console.error('Failed to get audio level:', error);
      }
    }
    return 0;
  }

  getListeningState(): ListeningState {
    return this.currentState;
  }

  subscribeToAudioLevels(callback: (level: number) => void): () => void {
    this.audioLevelListeners.push(callback);
    return () => {
      this.audioLevelListeners = this.audioLevelListeners.filter(l => l !== callback);
    };
  }

  private notifyAudioLevelListeners(level: number): void {
    this.audioLevelListeners.forEach(listener => listener(level));
  }

  async speak(text: string, interrupt: boolean = false): Promise<void> {
    if (!this.settings.voiceResponseEnabled) return;

    try {

// [NOX-DEV-32]: ongoing module refinement
