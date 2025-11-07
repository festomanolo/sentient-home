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

```bash
npm run build
npx cap copy android
npx cap update android
```

#### Plugin Not Found

Make sure the plugin is registered in `capacitor.config.ts` and `android/app/src/main/assets/capacitor.plugins.json`

## Performance Optimization

### Reduce App Size

1. Enable ProGuard in release builds
2. Remove unused dependencies
3. Optimize images and assets

### Improve Voice Recognition

1. Adjust microphone sensitivity in Settings
2. Use in quiet environment
3. Enable continuous listening for better response

### Battery Optimization

1. Disable continuous listening when not needed
2. Reduce weather update frequency
3. Pause sound detection when app is backgrounded

## Deployment

### Google Play Store

1. Create a Google Play Developer account
2. Generate a signed release APK
3. Create app listing with screenshots
4. Upload APK and submit for review

### Privacy Policy

Include information about:
- Microphone usage for voice commands
- Location usage for weather
- No data collection or storage
- Local processing of voice commands

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments in service files
- Check browser/Android console for error messages

## Next Steps

### Recommended Enhancements

1. **Google Calendar OAuth** - Implement full OAuth flow for real calendar sync
2. **Spotify Integration** - Add Spotify control alongside Lark Player
3. **Smart Home** - Integrate with smart home devices
4. **Routines** - Create automated routines based on time/location
5. **Multi-language** - Add support for multiple languages
6. **Voice Profiles** - Recognize different users by voice

### Code Improvements

1. Add unit tests for services
2. Implement error boundaries in React components
3. Add analytics for command usage
4. Optimize bundle size with code splitting
5. Add offline support with service workers

---

**NOX AI** - Your intelligent voice assistant is ready! 🎤🤖
