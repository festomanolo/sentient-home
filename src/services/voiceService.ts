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

// [NOX-DEV-32]: ongoing module refinement
