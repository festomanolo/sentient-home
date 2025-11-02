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

// [NOX-DEV-26]: ongoing module refinement
