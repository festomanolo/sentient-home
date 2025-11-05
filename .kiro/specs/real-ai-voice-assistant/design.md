# Design Document

## Overview

This design document outlines the architecture and implementation strategy for transforming the NOX AI application from a prototype with mocked functionality into a fully functional AI voice assistant. The system will integrate real voice recognition, AI-powered natural language processing, actual Android app control (specifically for Lark Player), and live service integrations for weather, calendar, and other data sources.

The core transformation involves:
1. Implementing real-time microphone visualization with audio level detection
2. Creating native Android bridges for controlling Lark Player (com.dywx.larplayer)
3. Integrating AI/NLP for intelligent command understanding
4. Connecting real APIs for weather and calendar data
5. Building a robust voice feedback system with natural responses

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React UI Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Microphone   │  │ Dashboard    │  │ Settings     │      │
│  │ Indicator    │  │ Widgets      │  │ Panel        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (TypeScript)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Voice        │  │ AI Command   │  │ App Control  │      │
│  │ Service      │  │ Processor    │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Weather      │  │ Calendar     │  │ Sound        │      │
│  │ Service      │  │ Service      │  │ Detection    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Capacitor Bridge Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Media        │  │ Intent       │  │ Permissions  │      │
│  │ Session      │  │ Handler      │  │ Manager      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Native Android Layer (Java/Kotlin)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Media        │  │ App          │  │ System       │      │
│  │ Controller   │  │ Launcher     │  │ Services     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Lark Player  │  │ Weather API  │  │ Google       │      │
│  │ (com.dywx)   │  │ (OpenWeather)│  │ Calendar API │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Voice Input Flow**:
   - User speaks → Microphone captures audio
   - Web Audio API analyzes volume/frequency
   - Microphone Indicator visualizes audio levels
   - Web Speech API transcribes speech to text
   - AI Command Processor interprets intent
   - Appropriate service executes action
   - Voice Synthesis provides feedback

2. **App Control Flow**:
   - Command identified as app control
   - App Control Service validates app availability
   - Capacitor plugin sends intent to Android
   - Android MediaSession API controls Lark Player
   - Status feedback returned to UI

3. **Data Integration Flow**:
   - Service requests data (weather/calendar)
   - API call made with authentication
   - Response cached for performance
   - Data formatted for voice/visual display
   - UI updated with real-time information

## Components and Interfaces

### 1. Microphone Indicator Component

**Purpose**: Visual feedback for audio input and system listening state

**Interface**:
```typescript
interface MicrophoneIndicatorProps {
  isListening: boolean;
  isProcessing: boolean;
  audioLevel: number; // 0-100
  state: 'inactive' | 'listening' | 'processing' | 'speaking' | 'error';
  errorMessage?: string;
}

interface MicrophoneIndicatorState {
  animationFrame: number;
  visualizerData: number[];
}
```

**Visual States**:
- **Inactive**: Gray, static orb
- **Listening**: Blue pulsing orb, size varies with audio level
- **Processing**: Purple spinning animation
- **Speaking**: Green wave animation
- **Error**: Red with error icon

**Implementation Details**:
- Uses Web Audio API `AnalyserNode` for real-time audio data
- Renders using CSS animations or Canvas for smooth 60fps visualization
- Displays decibel levels as expanding/contracting circles
- Shows frequency spectrum as animated bars around the orb

### 2. Enhanced Voice Service

**Purpose**: Real voice recognition with continuous listening and wake word detection

**Interface**:
```typescript
interface EnhancedVoiceService {
  // Core functionality
  startContinuousListening(): Promise<void>;
  stopListening(): void;
  speak(text: string, interrupt?: boolean): Promise<void>;
  
  // Audio monitoring
  getAudioLevel(): number;
  getListeningState(): ListeningState;
  subscribeToAudioLevels(callback: (level: number) => void): () => void;
  
  // Wake word detection
  setWakeWord(word: string): void;
  isWakeWordDetected(transcript: string): boolean;
  
  // Command processing
  subscribeToCommands(callback: (command: VoiceCommand) => void): () => void;
  getCommandConfidence(transcript: string): number;
}

type ListeningState = 'inactive' | 'listening' | 'processing' | 'speaking';

interface VoiceCommand {
  transcript: string;
  confidence: number;
  timestamp: Date;
  isWakeWordCommand: boolean;
}
```

**Key Enhancements**:
- Integrate with `soundDetectionService` for audio level monitoring
- Implement wake word detection using pattern matching
- Add confidence scoring for transcriptions
- Handle speech recognition errors gracefully with retry logic
- Maintain listening state across app lifecycle

### 3. AI Command Processor

**Purpose**: Intelligent natural language understanding and intent extraction

**Interface**:
```typescript
interface AICommandProcessor {
  processCommand(transcript: string): Promise<CommandIntent>;
  extractEntities(transcript: string): CommandEntities;
  getCommandSuggestions(partialCommand: string): string[];
  learnFromFeedback(command: string, wasSuccessful: boolean): void;
}

interface CommandIntent {
  action: CommandAction;
  confidence: number;
  entities: CommandEntities;
  requiresConfirmation: boolean;
}

type CommandAction = 
  | 'play_music' | 'pause_music' | 'next_track' | 'previous_track'
  | 'volume_up' | 'volume_down' | 'set_volume'
  | 'get_weather' | 'get_forecast'
  | 'get_calendar' | 'get_next_event'
  | 'open_app' | 'control_app'
  | 'set_timer' | 'set_alarm'
  | 'unknown';

interface CommandEntities {
  app?: string;
  location?: string;
  time?: Date;
  volume?: number;
  query?: string;
}
```

**Implementation Strategy**:
- Use pattern matching with regex for common commands
- Implement fuzzy matching for app names and locations
- Extract entities using NLP techniques (time parsing, location extraction)
- Build confidence scoring based on pattern matches and entity extraction
- Store command history for learning and improvement
- Support contextual commands (e.g., "louder" after "play music")

**Pattern Examples**:
```typescript
const commandPatterns = {
  play_music: [
    /^(play|start|resume)\s+(music|song|track|audio)/i,
    /^(play|start)\s+(.+)\s+in\s+lark/i,
    /^music\s+(on|play)/i
  ],
  pause_music: [
    /^(pause|stop|halt)\s+(music|song|track|audio)/i,
    /^(pause|stop)/i
  ],
  volume_control: [
    /^volume\s+(up|down|louder|quieter)/i,
    /^(louder|quieter|turn\s+it\s+(up|down))/i,
    /^set\s+volume\s+to\s+(\d+)/i
  ],
  weather: [
    /^(what'?s|how'?s|tell\s+me)\s+the\s+weather/i,
    /^weather\s+(today|now|forecast)/i,
    /^temperature\s+(outside|now)/i
  ]
};

// [NOX-DEV-49]: ongoing module refinement
