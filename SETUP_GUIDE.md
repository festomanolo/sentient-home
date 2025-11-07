# NOX AI - Complete Setup Guide for Real Implementation

This guide will help you set up NOX AI with real-world integrations and deploy it as a fully functional home assistant.

## 🚀 Quick Start

### 1. Basic Setup
```bash
# Clone and install
git clone <your-repo-url>
cd nox-ai-assistant
npm install

# Start development
npm run dev
```

### 2. Configure Real APIs

#### Weather API (Required for real weather data)
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Edit `src/services/weatherService.ts`:
   ```typescript
   private readonly API_KEY = 'your-actual-api-key-here';
   ```

#### Location Services
- The app will automatically request location permission
- Falls back to IP-based location if GPS is denied
- Saves location preferences locally

## 📱 Android Deployment (Real Device Control)

### Prerequisites
- Android Studio installed
- Android SDK configured
- Physical Android device for testing

### 1. Build for Android
```bash
# Build the web app
npm run build

# Add Android platform
npx cap add android

# Sync web assets
npx cap sync android

# Open in Android Studio
npx cap open android
```

### 2. Configure Android Permissions
Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Location for weather -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Microphone for voice commands -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- Media control -->
<uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />
<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />

<!-- App launching -->
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

<!-- Bluetooth -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- System volume -->
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### 3. Enable Real App Control

#### For Lark Player Integration:
1. Install Lark Player on your Android device
2. Grant NOX AI notification access in Android Settings
3. Enable "Device Administrator" permissions for full control

#### For System Media Control:
1. Go to Android Settings > Apps > NOX AI > Permissions
2. Enable "Notification Access"
3. Enable "Device Admin Apps"
4. Grant "Modify System Settings"

## 🎤 Voice Setup (Natural Speech)

### 1. Microphone Permissions
The app will automatically request microphone access. For best results:
- Use a quiet environment for initial setup
- Speak clearly and at normal volume
- The wake word is "Hey NOX" (customizable in settings)

### 2. Voice Optimization
The app automatically selects the best available voice:
- Prefers female voices for Alexa-like experience
- Uses local system voices for privacy
- Adjusts speech rate and pitch for natural sound

### 3. Continuous Listening
- Enable in Settings for hands-free operation
- Uses minimal battery with smart detection
- Automatically restarts if interrupted

## 🏠 Real Home Integration

### 1. Bluetooth Device Control
```javascript
// The app automatically detects:
- Bluetooth speakers and headphones
- Car audio systems
- Smart home devices with Bluetooth

// Real control includes:
- Play/pause/next/previous
- Volume adjustment
- Battery level monitoring
- Multi-device switching
```

### 2. App Control Setup
For real app control on Android:

1. **Enable Accessibility Service:**
   - Settings > Accessibility > NOX AI > Enable
   
2. **Grant Special Permissions:**
   - Settings > Apps > Special Access > Device Admin Apps > NOX AI

3. **Supported Apps:**
   - Lark Player (full control)
   - Spotify (basic control)
   - YouTube/YouTube Music
   - WhatsApp (message sending)
   - Camera (photo/video)
   - System settings

### 3. Calendar Integration
The app integrates with your device calendar:
- Reads existing events
- Provides voice summaries
- Sends reminders
- Supports multiple calendar accounts

## 🌐 Network Features

### 1. Weather Integration
- Real-time weather from OpenWeatherMap
- GPS-based location detection
- 5-day forecast
- Weather-based suggestions

### 2. World Clock
- Real timezone data
- Automatic daylight saving adjustments
- Voice queries for any city
- Multiple timezone display

## 🔧 Advanced Configuration

### 1. Voice Customization
Edit `src/services/voiceService.ts`:
```typescript
// Change wake word
wakeWord: 'hey nox', // Change to your preference

// Adjust voice characteristics
voiceRate: 1.0,     // Speech speed (0.5-2.0)
voicePitch: 1.0,    // Voice pitch (0.5-2.0)
volume: 0.8,        // Volume level (0.0-1.0)
```

### 2. Sound Detection Tuning
Edit `src/services/soundDetectionService.ts`:
```typescript
// Adjust sensitivity
sensitivity: 0.7,        // Detection threshold (0.0-1.0)
noiseThreshold: 30,      // Background noise level
enableVoiceDetection: true,
enableKnockDetection: true,
enablePhoneDetection: true,
```

### 3. App Control Customization
Add new apps in `src/services/appControlService.ts`:
```typescript
'your_app': {
  packageName: 'com.yourapp.package',
  appName: 'Your App Name',
  isInstalled: false,
  canControl: true,
  supportedActions: ['open', 'play', 'pause']
}
```

## 🔒 Privacy & Security

### 1. Local Processing
- All voice processing happens on-device
- No voice data sent to external servers
- Weather API only sends location coordinates

### 2. Data Storage
- Settings stored locally in browser/app storage
- No cloud synchronization by default
- Calendar data remains on device

### 3. Permissions
- Only requests necessary permissions
- Graceful fallbacks if permissions denied
- User can disable features individually

## 🚨 Troubleshooting

### Common Issues:

1. **Voice not working:**
   - Check microphone permissions
   - Ensure browser supports Web Speech API
   - Try different browsers (Chrome recommended)

2. **Weather not loading:**
   - Verify API key is correct
   - Check internet connection
   - Allow location permissions

// [NOX-DEV-89]: ongoing module refinement
