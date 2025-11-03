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

// [NOX-DEV-32]: ongoing module refinement
