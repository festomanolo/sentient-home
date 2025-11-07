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
```

### 4. Lark Player Control Service

**Purpose**: Native Android integration for controlling Lark Player app

**Interface**:
```typescript
interface LarkPlayerControlService {
  // App detection
  isLarkPlayerInstalled(): Promise<boolean>;
  isLarkPlayerRunning(): Promise<boolean>;
  
  // Playback control
  play(): Promise<boolean>;
  pause(): Promise<boolean>;
  next(): Promise<boolean>;
  previous(): Promise<boolean>;
  
  // Volume control
  setVolume(level: number): Promise<boolean>;
  increaseVolume(amount?: number): Promise<boolean>;
  decreaseVolume(amount?: number): Promise<boolean>;
  
  // App management
  launchLarkPlayer(): Promise<boolean>;
  getPlaybackState(): Promise<PlaybackState>;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTrack?: string;
  artist?: string;
  duration?: number;
  position?: number;
}
```

**Implementation Approach**:

**Option 1: Android MediaSession API (Recommended)**
- Use Android's `MediaController` to control active media sessions
- Detect Lark Player's media session by package name
- Send media commands (play, pause, next, previous)
- Monitor playback state changes

**Option 2: Android Intents**
- Send broadcast intents to Lark Player
- Use standard media intent actions (ACTION_MEDIA_BUTTON)
- Launch app using package manager intents

**Option 3: Custom Capacitor Plugin**
- Create native Android plugin for direct app control
- Implement MediaController wrapper
- Handle permissions and error cases

**Capacitor Plugin Structure**:
```typescript
// TypeScript interface
import { registerPlugin } from '@capacitor/core';

interface LarkPlayerPlugin {
  checkInstalled(): Promise<{ installed: boolean }>;
  sendMediaCommand(options: { command: string }): Promise<{ success: boolean }>;
  getPlaybackState(): Promise<PlaybackState>;
  launchApp(): Promise<{ success: boolean }>;
}

const LarkPlayer = registerPlugin<LarkPlayerPlugin>('LarkPlayer');
```

**Android Implementation** (Java/Kotlin):
```java
@CapacitorPlugin(name = "LarkPlayer")
public class LarkPlayerPlugin extends Plugin {
    private MediaController mediaController;
    
    @PluginMethod
    public void sendMediaCommand(PluginCall call) {
        String command = call.getString("command");
        MediaController controller = getMediaController();
        
        if (controller != null) {
            switch (command) {
                case "play":
                    controller.getTransportControls().play();
                    break;
                case "pause":
                    controller.getTransportControls().pause();
                    break;
                case "next":
                    controller.getTransportControls().skipToNext();
                    break;
                case "previous":
                    controller.getTransportControls().skipToPrevious();
                    break;
            }
            call.resolve(new JSObject().put("success", true));
        } else {
            call.reject("Media controller not available");
        }
    }
    
    private MediaController getMediaController() {
        MediaSessionManager manager = (MediaSessionManager) 
            getContext().getSystemService(Context.MEDIA_SESSION_SERVICE);
        
        List<MediaController> controllers = manager.getActiveSessions(
            new ComponentName(getContext(), NotificationListener.class)
        );
        
        for (MediaController controller : controllers) {
            if (controller.getPackageName().equals("com.dywx.larplayer")) {
                return controller;
            }
        }
        return null;
    }
}
```

### 5. Real Weather Integration

**Current State**: Already has OpenWeatherMap integration but needs API key configuration

**Enhancements Needed**:
- Add API key configuration UI in settings
- Implement better error handling for API failures
- Add voice-optimized weather descriptions
- Cache weather data more aggressively
- Support multiple location queries

**Voice Response Format**:
```typescript
function formatWeatherForVoice(weather: WeatherData): string {
  const temp = Math.round(weather.temperature);
  const condition = weather.description;
  const location = weather.location;
  
  let response = `It's currently ${temp} degrees and ${condition} in ${location}.`;
  
  if (weather.feelsLike !== temp) {
    response += ` It feels like ${weather.feelsLike} degrees.`;
  }
  
  const advice = getWeatherAdvice(weather);
  if (advice) {
    response += ` ${advice}`;
  }
  
  return response;
}
```

### 6. Google Calendar Integration

**Current State**: Has local calendar with mock events

**Required Changes**:
- Implement Google Calendar API OAuth flow
- Add calendar sync service
- Store refresh tokens securely
- Handle API rate limits
- Support multiple calendars

**Google Calendar API Integration**:
```typescript
interface GoogleCalendarService {
  authenticate(): Promise<void>;
  isAuthenticated(): boolean;
  syncEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]>;
  getUpcomingEvents(count: number): Promise<CalendarEvent[]>;
  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
}

class GoogleCalendarServiceImpl implements GoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  async authenticate(): Promise<void> {
    // Use Google OAuth 2.0 flow
    // For Capacitor app, use @codetrix-studio/capacitor-google-auth
    const auth = await GoogleAuth.signIn();
    this.accessToken = auth.authentication.accessToken;
    this.refreshToken = auth.authentication.refreshToken;
    
    // Store tokens securely
    await this.storeTokens();
  }
  
  async syncEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );
    
    const data = await response.json();
    return this.convertGoogleEvents(data.items);
  }
}
```

**Dependencies to Add**:
```json
{
  "@codetrix-studio/capacitor-google-auth": "^3.3.0"
}
```

## Data Models

### Audio Visualization Data
```typescript
interface AudioVisualizationData {
  timestamp: number;
  volume: number; // 0-100
  frequency: Float32Array; // FFT data
  isVoiceDetected: boolean;
  isSpeaking: boolean;
}
```

### Command History
```typescript
interface CommandHistoryEntry {
  id: string;
  timestamp: Date;
  transcript: string;
  intent: CommandIntent;
  success: boolean;
  executionTime: number; // milliseconds
  errorMessage?: string;
}
```

### App Control State
```typescript
interface AppControlState {
  larkPlayer: {
    installed: boolean;
    running: boolean;
    playbackState: PlaybackState;
    lastCommand: string;
    lastCommandTime: Date;
  };
  systemVolume: number;
  mediaSessionActive: boolean;
}
```

## Error Handling

### Voice Recognition Errors
```typescript
enum VoiceErrorType {
  NO_SPEECH = 'no-speech',
  AUDIO_CAPTURE = 'audio-capture',
  NOT_ALLOWED = 'not-allowed',
  NETWORK = 'network',
  ABORTED = 'aborted'
}

interface VoiceErrorHandler {
  handleError(error: VoiceErrorType): void;
  getErrorMessage(error: VoiceErrorType): string;
  shouldRetry(error: VoiceErrorType): boolean;
}
```

**Error Recovery Strategies**:
- **NO_SPEECH**: Retry after 2 seconds, notify user if persistent
- **AUDIO_CAPTURE**: Check microphone permissions, guide user to settings
- **NOT_ALLOWED**: Show permission request UI with instructions
- **NETWORK**: Queue commands offline, retry when connection restored
- **ABORTED**: Log and restart recognition

### App Control Errors
```typescript
enum AppControlErrorType {
  APP_NOT_INSTALLED = 'app_not_installed',
  APP_NOT_RUNNING = 'app_not_running',
  PERMISSION_DENIED = 'permission_denied',
  COMMAND_FAILED = 'command_failed',
  TIMEOUT = 'timeout'
}

function handleAppControlError(error: AppControlErrorType, appName: string): string {
  switch (error) {
    case AppControlErrorType.APP_NOT_INSTALLED:
      return `${appName} is not installed on your device. Would you like to install it?`;
    case AppControlErrorType.APP_NOT_RUNNING:
      return `${appName} is not currently running. Let me start it for you.`;
    case AppControlErrorType.PERMISSION_DENIED:
      return `I don't have permission to control ${appName}. Please grant the necessary permissions in settings.`;
    case AppControlErrorType.COMMAND_FAILED:
      return `I couldn't execute that command in ${appName}. Please try again.`;
    case AppControlErrorType.TIMEOUT:
      return `The command timed out. ${appName} might not be responding.`;
  }
}
```

### API Integration Errors
```typescript
interface APIErrorHandler {
  handleWeatherError(error: Error): string;
  handleCalendarError(error: Error): string;
  shouldUseCache(error: Error): boolean;
}

class APIErrorHandlerImpl implements APIErrorHandler {
  handleWeatherError(error: Error): string {
    if (error.message.includes('API key')) {
      return "Weather service is not configured. Please add your API key in settings.";
    }
    if (error.message.includes('network')) {
      return "I can't reach the weather service right now. Check your internet connection.";
    }
    if (error.message.includes('location')) {
      return "I couldn't determine your location. Please enable location services.";
    }
    return "I'm having trouble getting the weather right now. Please try again later.";
  }
  
  shouldUseCache(error: Error): boolean {
    return error.message.includes('network') || error.message.includes('timeout');
  }
}
```

## Testing Strategy

### Unit Tests

**Voice Service Tests**:
- Test wake word detection with various phrases
- Test audio level calculation accuracy
- Test speech recognition event handling
- Test error recovery mechanisms

**AI Command Processor Tests**:
- Test intent extraction for all command types
- Test entity extraction (apps, locations, times, volumes)
- Test confidence scoring accuracy
- Test fuzzy matching for app names
- Test contextual command understanding

**App Control Service Tests**:
- Mock Android MediaSession API
- Test command execution success/failure paths
- Test app detection logic
- Test volume control calculations

### Integration Tests

**Voice-to-Action Flow**:
1. Simulate voice input "play music"
2. Verify command processing
3. Verify Lark Player control attempt
4. Verify voice feedback

**Weather Integration**:
1. Mock OpenWeatherMap API responses
2. Test location detection
3. Test voice response formatting
4. Test caching behavior

**Calendar Integration**:
1. Mock Google Calendar API
2. Test OAuth flow
3. Test event synchronization
4. Test voice query responses

### Manual Testing Checklist

- [ ] Microphone indicator animates with real audio
- [ ] Wake word "Hey NOX" activates listening
- [ ] "Play music" controls Lark Player
- [ ] "Pause music" pauses Lark Player
- [ ] "Next song" skips to next track
- [ ] "Volume up/down" adjusts system volume
- [ ] Weather queries return real data
- [ ] Calendar queries return real events
- [ ] Voice responses are natural and clear
- [ ] Error messages are helpful
- [ ] App works in background
- [ ] Permissions are requested properly

## Performance Considerations

### Audio Processing
- Use `requestAnimationFrame` for smooth 60fps visualization
- Throttle audio analysis to every 100ms to reduce CPU usage
- Use Web Workers for heavy audio processing if needed

### API Caching
- Cache weather data for 10 minutes
- Cache calendar events for 5 minutes
- Implement exponential backoff for failed API calls
- Use IndexedDB for persistent caching

### Memory Management
- Limit command history to last 100 entries
- Clean up audio contexts when not in use
- Unsubscribe from event listeners on component unmount
- Use weak references for large data structures

### Battery Optimization
- Reduce wake word detection frequency when screen is off
- Pause audio visualization when app is backgrounded
- Batch API requests when possible
- Use efficient audio processing algorithms

## Security Considerations

### API Keys
- Store API keys in secure storage (Capacitor Preferences)
- Never commit API keys to version control
- Use environment variables for development
- Implement key rotation mechanism

### Permissions
- Request microphone permission with clear explanation
- Request location permission only when needed
- Request notification listener permission for media control
- Handle permission denials gracefully

### Data Privacy
- Don't store voice recordings
- Encrypt sensitive data (tokens, API keys)
- Clear command history on user request
- Implement opt-out for data collection

### OAuth Security
- Use PKCE flow for Google Calendar OAuth
- Store refresh tokens securely
- Implement token expiration handling
- Validate redirect URIs

## Deployment Considerations

### Android Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
<uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />
```

### Build Configuration
- Enable ProGuard for release builds
- Configure proper signing keys
- Set minimum SDK version to 24 (Android 7.0)
- Target SDK version 34 (Android 14)

### App Store Requirements
- Provide clear privacy policy
- Explain microphone usage in app description
- Include screenshots showing key features
- Provide demo video of voice commands

## Future Enhancements

### Phase 2 Features
- Multi-language support
- Custom wake word training
- Spotify/YouTube Music integration
- Smart home device control
- Routine automation
- Voice profile recognition

### AI Improvements
- Use cloud-based NLP (DialogFlow, Wit.ai)
- Implement conversation context
- Add sentiment analysis
- Support follow-up questions
- Learn user preferences

### Advanced Media Control
- Playlist management
- Music recommendations
- Cross-app media control
- Bluetooth device management
- Audio equalizer control
