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
  - Implement automatic app launching when user says "play music" and app isn't running
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2, 8.4, 8.5_

- [x] 6. Integrate AI Command Processor with Voice Service
  - Update `voiceService.ts` to use `aiCommandProcessor` for command interpretation
  - Modify `onresult` handler to pass transcripts to AI processor for intent extraction
  - Implement confidence threshold checking (only execute commands with confidence > 0.6)
  - Add clarification requests when confidence is low ("I didn't quite catch that, could you repeat?")
  - Route commands to appropriate services based on extracted intent (app control, weather, calendar)
  - Add voice feedback for command execution success/failure
  - _Requirements: 3.1, 3.2, 3.3, 9.1, 9.2, 9.3_

- [x] 7. Implement Real-Time Processing Feedback UI
  - Create `CommandFeedback.tsx` component to display recognized commands and execution status
  - Show recognized transcript text in real-time as speech is processed
  - Display processing indicator when AI is analyzing command
  - Show success/failure messages for 2 seconds after command execution
  - Add command history log accessible from UI showing past commands and outcomes
  - Integrate with microphone indicator to show coordinated feedback
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 8. Configure Weather Service with API Key Management
  - Add API key configuration UI in Settings page for OpenWeatherMap
  - Update `weatherService.ts` to use configured API key from settings
  - Implement better error handling for missing API key with clear user instructions
  - Add voice-optimized weather response formatting with natural language
  - Enhance caching to store weather data for 10 minutes as specified
  - Implement location-based weather queries ("weather in Tokyo")
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Integrate Google Calendar API
- [x] 9.1 Set up Google Calendar OAuth authentication
  - Install `@codetrix-studio/capacitor-google-auth` package
  - Configure Google Cloud Console project with Calendar API enabled
  - Implement OAuth 2.0 flow in Settings page for calendar connection
  - Store access and refresh tokens securely using Capacitor Preferences
  - Add authentication status indicator in UI
  - _Requirements: 5.5, 10.4_

- [x] 9.2 Implement calendar synchronization service
  - Create `googleCalendarService.ts` with Google Calendar API integration
  - Implement `syncEvents()` method to fetch events from Google Calendar API
  - Add automatic sync every 5 minutes to keep calendar data fresh
  - Convert Google Calendar event format to app's `CalendarEvent` interface
  - Handle API rate limits and errors gracefully
  - Update `calendarService.ts` to use real Google Calendar data instead of mock events
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

- [x] 9.3 Add voice-optimized calendar responses
  - Implement natural language formatting for calendar events in voice responses
  - Add support for "what's on my calendar", "next meeting", "schedule today" queries
  - Format event times in conversational format ("at 2 PM" instead of "14:00")
  - Include relevant event details (location, attendees) in voice responses
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Implement Continuous Wake Word Detection
  - Update `voiceService.ts` to enable continuous listening mode by default
  - Implement wake word detection for "Hey NOX" using pattern matching on transcripts
  - Add 10-second command listening window after wake word detection
  - Implement automatic return to wake word listening after timeout
  - Add settings toggle for always-listening mode (no wake word required)
  - Ensure listening persists when app is backgrounded or screen is off
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 11. Enhance Voice Response System with Natural Language
  - Update `voiceService.ts` to use more natural, conversational response templates
  - Implement dynamic response generation based on command context
  - Add confirmation messages for successful actions ("I've started playing music for you")
  - Add helpful error messages that guide users ("Lark Player isn't installed. Would you like to install it?")
  - Implement voice settings (rate, pitch, volume) configuration in Settings page
  - Add voice response enable/disable toggle in settings
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Add Permission Management System
  - Create `permissionsService.ts` to handle Android permission requests
  - Implement microphone permission request with explanation dialog
  - Add location permission request for weather features
  - Implement notification listener permission request for media control
  - Create UI in Settings to show permission status and guide users to grant permissions
  - Handle permission denial gracefully with clear instructions for enabling in device settings
  - _Requirements: 1.5, 8.5, 10.4, 10.5_

- [x] 13. Integrate All Components in SmartDashboard
  - Update `SmartDashboard.tsx` to include new `MicrophoneIndicator` component
  - Add `CommandFeedback` component to show real-time command processing
  - Connect voice service to start listening on component mount
  - Implement command routing to appropriate services (app control, weather, calendar)
  - Add error boundary to handle and display errors gracefully
  - Ensure all services are initialized and connected properly
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3, 9.4_

- [x] 14. Update Settings Page with New Configuration Options
  - Add OpenWeatherMap API key input field with validation
  - Add Google Calendar connection button with OAuth flow
  - Add voice settings section (rate, pitch, volume, voice response toggle)
  - Add wake word configuration input
  - Add continuous listening toggle
  - Add microphone sensitivity slider
  - Add permission status indicators with action buttons
  - _Requirements: 4.5, 5.5, 6.5, 7.4, 7.5, 10.5_

- [x] 15. Implement Error Handling and Recovery
  - Add comprehensive error handling in voice service for all speech recognition errors
  - Implement retry logic for transient errors (no-speech, network)
  - Add user-friendly error messages for permission denials
  - Implement fallback behavior when APIs are unavailable (use cached data)
  - Add error logging for debugging and improvement
  - Create error recovery UI that guides users to fix issues
  - _Requirements: 1.5, 2.7, 4.4, 8.5, 10.5_

- [x] 16. Build and Test Android APK
  - Run `npm run build` to create production build
  - Sync Capacitor with `npx cap sync android`
  - Open Android Studio and build signed APK
  - Test on physical Android device with Lark Player installed
  - Verify all voice commands work correctly
  - Test microphone indicator animations
  - Verify Lark Player control (play, pause, next, volume)
  - Test weather and calendar integrations
  - Verify permissions are requested properly
  - _Requirements: All requirements_
