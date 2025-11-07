# NOX AI - Advanced Home Assistant

A comprehensive, next-generation home assistant application built with React, TypeScript, and real-world integrations. NOX AI transforms your device into an intelligent companion that can control apps, monitor your environment, manage your schedule, and respond to voice commands.

## 🌟 Features

### 🎤 **Real Voice Recognition & Synthesis**
- Continuous voice listening with wake word detection ("Hey NOX")
- Natural language processing for complex commands
- Text-to-speech responses with customizable voice settings
- Multi-language support

### 🌤️ **Live Weather Integration**
- Real-time weather data from OpenWeatherMap API
- Location-based weather using device GPS
- 5-day weather forecast
- Detailed weather metrics (humidity, wind, visibility, UV index)

### 🌍 **World Clock & Timezone Management**
- Multiple timezone support with live updates
- Add/remove custom timezones
- Day/night indicators for each location
- Voice commands for time queries ("What time is it in Tokyo?")

### 📅 **Smart Calendar Integration**
- Real calendar event synchronization
- Today's schedule and upcoming events
- Voice-activated calendar queries
- Event reminders and notifications
- Multiple calendar categories (work, personal, health, social)

### 📱 **Android App Control**
- Control external apps like Lark Player, Spotify, YouTube
- Media playback control (play, pause, next, previous)
- Volume management
- App launching via voice commands
- Support for WhatsApp, Camera, Settings, and more

### 🎵 **Advanced Music Control**
- Bluetooth device management
- Multi-device audio control
- Playlist management with shuffle/repeat
- Real-time playback tracking
- Battery level monitoring for connected devices

### 🔊 **Real-Time Sound Detection**
- Live microphone analysis using Web Audio API
- Intelligent sound pattern recognition:
  - Door knocks
  - Phone rings
  - Voice detection
  - Music/TV audio
  - Appliance sounds
  - Alarm detection
- Adaptive volume control based on environment
- Sound confidence scoring and frequency analysis

### 🤖 **Intelligent Command Processing**
- Natural language understanding
- Context-aware responses
- Smart home automation
- Personalized greetings ("Welcome back, Manolo!")
- Learning from user patterns

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd nox-ai-assistant
   npm install
   ```

2. **Configure API Keys**
   ```bash
   # Add your OpenWeatherMap API key to src/services/weatherService.ts
   # Get your free API key at: https://openweathermap.org/api
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Mobile Deployment (Android)

NOX AI is built with Capacitor for native mobile deployment:

```bash
# Build the web app
npm run build

# Add Android platform
npx cap add android

# Sync web assets
npx cap sync

# Open in Android Studio
npx cap open android
```

## 🎯 Voice Commands

NOX AI responds to natural language commands:

### Weather
- "What's the weather?"
- "How's the weather today?"
- "What's the temperature outside?"

### Time & World Clock
- "What time is it?"
- "What time is it in Tokyo?"
- "Current time in London"

### Calendar
- "What's on my calendar?"
- "What's my schedule today?"
- "What's my next meeting?"
- "Calendar for tomorrow"

### Music Control
- "Play music"
- "Pause music"
- "Next song"
- "Volume up"
- "Set volume to 50"

### App Control
- "Open Lark Player"
- "Launch Spotify"
- "Play in YouTube"
- "Take a photo"
- "Open camera"

### System
- "Volume up/down"
- "Hello" / "Hi" (greetings)
- "Thank you"

## 🏗️ Architecture

### Core Services
- **VoiceService**: Speech recognition and synthesis
- **WeatherService**: Weather API integration
- **WorldClockService**: Timezone management
- **CalendarService**: Event management
- **AppControlService**: External app control
- **SoundDetectionService**: Real-time audio analysis
- **CommandProcessor**: Natural language processing

### Key Components
- **SmartDashboard**: Main interface with all features
- **WeatherWidget**: Live weather display
- **WorldClock**: Multi-timezone clock
- **CalendarWidget**: Schedule management
- **AIOrb**: Animated voice interaction indicator

## 🔧 Configuration

### Weather API Setup
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add your API key to `src/services/weatherService.ts`:
   ```typescript
   private readonly API_KEY = 'your-api-key-here';
   ```

### Voice Settings
Customize voice recognition and synthesis in the Settings page:
- Language selection
- Voice rate and pitch
- Wake word customization
- Continuous listening toggle

### Sound Detection
Adjust microphone sensitivity and sound detection thresholds:
- Sensitivity levels
- Noise threshold
- Enable/disable specific sound types

## 🎨 Customization

### Adding New Voice Commands
1. Add command patterns to `voiceService.getCommandPatterns()`
2. Implement command handling in `commandProcessor.executeCommand()`
3. Add response logic for new functionality

### Integrating New Apps
1. Add app definitions to `appControlService.knownApps`
2. Implement control actions in `executeAppAction()`
3. Add voice command patterns

### Custom Themes
Modify `tailwind.config.ts` for custom styling and themes.

## 🔒 Privacy & Security

- **Local Processing**: All voice processing happens on-device
- **No Data Collection**: Personal data stays on your device
- **Privacy Mode**: Disable learning and data collection
- **Secure API Calls**: Weather data only, no personal information shared

## 📋 Requirements

- **Browser**: Modern browser with Web Speech API support
- **Microphone**: For voice commands and sound detection
- **Location**: For weather data (optional)
- **Internet**: For weather API and some app controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- Web Speech API for voice capabilities
- Capacitor for mobile deployment
- ShadCN UI for beautiful components
- React and TypeScript communities

---

**NOX AI** - Your intelligent home companion, ready to assist with everything from weather updates to app control, all through natural voice interaction. Welcome to the future of home automation! 🏠🤖