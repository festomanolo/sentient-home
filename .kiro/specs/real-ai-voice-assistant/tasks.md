# Implementation Plan

- [x] 1. Create Microphone Indicator Component with Real-Time Audio Visualization
  - Create `MicrophoneIndicator.tsx` component with visual states (inactive, listening, processing, speaking, error)
  - Integrate with Web Audio API `AnalyserNode` to get real-time audio frequency data
  - Implement smooth CSS/Canvas animations for audio level visualization (pulsing orb that scales with volume)
  - Add visual feedback for different states with color coding (blue=listening, purple=processing, green=speaking, red=error)
  - Connect to `soundDetectionService` to display current audio levels
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Enhance Voice Service with Audio Level Monitoring
  - Modify `voiceService.ts` to expose real-time audio level data
  - Add `getAudioLevel()` method that returns current microphone input volume (0-100)
  - Implement `subscribeToAudioLevels()` for components to receive audio level updates
  - Add `getListeningState()` method to expose current state (inactive/listening/processing/speaking)
  - Integrate with existing `soundDetectionService` for audio analysis
  - Ensure audio monitoring works alongside speech recognition without conflicts
  - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2_

- [x] 3. Implement AI Command Processor with Natural Language Understanding
  - Create new `aiCommandProcessor.ts` service for intelligent command interpretation
  - Implement pattern matching with regex for common command types (music control, weather, calendar, app control)
  - Add entity extraction for app names, locations, times, and volume levels using NLP techniques
  - Build confidence scoring system based on pattern matches and entity extraction quality
  - Implement fuzzy matching for app names to handle variations (e.g., "lark" → "Lark Player")
  - Add contextual command understanding (track previous command for context like "louder" after "play music")
  - Create command history storage for learning and improvement
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Create Capacitor Plugin for Lark Player Control
- [x] 4.1 Set up Capacitor plugin structure for Android media control
  - Create plugin definition file `LarkPlayerPlugin.ts` with TypeScript interface
  - Define methods: `checkInstalled()`, `sendMediaCommand()`, `getPlaybackState()`, `launchApp()`
  - Register plugin with Capacitor using `registerPlugin()`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 8.1, 8.2_

- [x] 4.2 Implement Android native plugin code for media session control
  - Create `LarkPlayerPlugin.java` in `android/app/src/main/java/`
  - Implement `MediaController` integration to detect and control Lark Player's media session
  - Add methods to send play, pause, next, previous commands via `TransportControls`
  - Implement app detection by checking for package name "com.dywx.larplayer"
  - Add app launching capability using Android Intent system
  - Handle permissions for `BIND_NOTIFICATION_LISTENER_SERVICE` and `MEDIA_CONTENT_CONTROL`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.2, 8.3, 10.1, 10.2, 10.3_

- [x] 4.3 Update AndroidManifest.xml with required permissions
  - Add `RECORD_AUDIO`, `INTERNET`, `ACCESS_FINE_LOCATION`, `BIND_NOTIFICATION_LISTENER_SERVICE`, `MEDIA_CONTENT_CONTROL` permissions
  - Add notification listener service declaration for media session access
  - _Requirements: 8.5, 10.4, 10.5_

- [x] 5. Enhance App Control Service with Real Lark Player Integration
  - Update `appControlService.ts` to use the new Capacitor plugin instead of mocked functionality
  - Implement `controlLarkPlayer()` method that calls native plugin for play/pause/next/previous
  - Add real app detection using `checkInstalled()` from plugin
  - Implement volume control using Android system volume APIs through plugin
  - Add playback state monitoring to verify command execution
  - Handle errors when Lark Player is not installed or not running with user-friendly messages

// [NOX-DEV-51]: ongoing module refinement
