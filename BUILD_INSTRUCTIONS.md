# NOX AI - Build and Deployment Instructions

## Prerequisites

- Node.js 18+ and npm
- Android Studio (for Android builds)
- Java JDK 17+
- OpenWeatherMap API key (for weather features)

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

#### Weather API
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Open the app and go to Settings
3. Enter your API key in the Weather Setup section

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Android Build

### 1. Build Web Assets

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### 2. Sync Capacitor

```bash
npx cap sync android
```

This copies web assets to the Android project and updates native dependencies.

### 3. Open in Android Studio

```bash
npx cap open android
```

### 4. Configure Android Project

#### Enable Notification Listener Service

For media control to work, users need to enable the Notification Listener permission:

1. On the device, go to **Settings > Apps > Special app access > Notification access**
2. Find **NOX AI** and enable it

This permission allows the app to control media playback in Lark Player.

#### Test Permissions

The app requires these permissions:
- **Microphone** - For voice commands
- **Location** - For weather data
- **Notification Listener** - For media control

### 5. Build APK

In Android Studio:

1. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for the build to complete
3. Find the APK in `android/app/build/outputs/apk/debug/app-debug.apk`

For a release build:

1. Generate a signing key (if you don't have one)
2. Configure signing in `android/app/build.gradle`
3. Select **Build > Generate Signed Bundle / APK**
4. Choose APK and follow the wizard

## Testing Checklist

### Voice Recognition
- [ ] Microphone indicator shows audio levels
- [ ] Wake word "Hey NOX" activates listening
- [ ] Voice commands are recognized and displayed
- [ ] Voice responses are clear and natural

### Lark Player Control
- [ ] "Play music" starts Lark Player
- [ ] "Pause music" pauses playback
- [ ] "Next song" skips to next track
- [ ] "Previous song" goes to previous track
- [ ] "Volume up/down" adjusts system volume

### Weather Integration
- [ ] "What's the weather" returns real weather data
- [ ] Weather widget displays current conditions
- [ ] Location is detected automatically
- [ ] Weather updates every 10 minutes

### Calendar Integration
- [ ] "What's on my calendar" lists today's events
- [ ] "Next meeting" announces upcoming event
- [ ] Calendar widget shows upcoming events
- [ ] Events sync properly

### AI Command Processing
- [ ] Natural language commands work (e.g., "louder" after "play music")
- [ ] Fuzzy app name matching works (e.g., "lark" → "Lark Player")
- [ ] Low confidence commands ask for clarification
- [ ] Command history is tracked

### UI/UX
- [ ] Microphone indicator animates with audio
- [ ] Command feedback shows processing status
- [ ] Success/error messages display correctly
- [ ] Settings page allows configuration
- [ ] Theme toggle works

### Permissions
- [ ] Microphone permission requested on first use
- [ ] Location permission requested for weather
- [ ] Notification listener permission instructions shown
- [ ] Permission denial handled gracefully

### Error Handling
- [ ] Network errors show helpful messages
- [ ] Missing API key prompts configuration
- [ ] App not installed errors are clear
- [ ] Voice recognition errors retry automatically

## Troubleshooting

### Microphone Not Working

1. Check browser/app permissions
2. Ensure microphone is not used by another app
3. Try restarting the app
4. Check Settings > Microphone permission

### Lark Player Control Not Working

1. Ensure Lark Player is installed
2. Enable Notification Listener permission:
   - Settings > Apps > Special app access > Notification access > NOX AI
3. Start playing music in Lark Player first
4. Try the voice command again

### Weather Not Loading

1. Check if API key is configured (Settings > Weather Setup)
2. Verify internet connection
3. Check location permissions
4. Try manual location in weather service

### Voice Commands Not Recognized

1. Speak clearly and at normal pace
2. Reduce background noise
3. Check microphone sensitivity in Settings
4. Try using text commands to test functionality

### Build Errors

#### Gradle Build Failed

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

#### Capacitor Sync Issues

// [NOX-DEV-85]: ongoing module refinement
