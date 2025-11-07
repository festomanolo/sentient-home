# Capacitor Setup Guide for NOX AI

NOX AI is now configured with Capacitor to build native Android APK and iOS apps!

## Prerequisites

Before building the native apps, ensure you have:
- **Node.js** and **npm** installed
- **Git** installed
- For **Android**: Android Studio installed
- For **iOS**: macOS with Xcode installed (iOS development requires macOS)

## Setup Instructions

### 1. Clone the Project

1. Clone your repository locally:
   ```bash
   git clone https://github.com/festomanolo/sentient-home.git
   cd sentient-home
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Capacitor (Already configured)

The project already has `capacitor.config.ts` configured with:
- App ID: `com.manolo.noxai`
- App Name: `NOX AI`

### 4. Add Native Platforms

Add Android and/or iOS platforms:

```bash
# For Android
npx cap add android

# For iOS (macOS only)
npx cap add ios
```

### 5. Build the Web Assets

```bash
npm run build
```

### 6. Sync Capacitor

Sync the web build with native platforms:

```bash
npx cap sync
```

**Important**: Run `npx cap sync` after every `git pull` to keep native platforms updated.

### 7. Update Native Platform Dependencies

```bash
# For Android
npx cap update android

# For iOS
npx cap update ios
```

## Building and Running

### For Android

#### Run on Emulator or Device

```bash
npx cap run android
```

This will:
1. Open Android Studio
2. Build the project
3. Install and run on connected device/emulator

#### Build APK Manually

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. In Android Studio:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - APK will be generated in `android/app/build/outputs/apk/`

### For iOS

```bash
npx cap run ios
```

This will open Xcode where you can:
- Configure signing
- Build and run on simulator or device

## Development Workflow

1. **Edit code locally**: `npm run dev`
2. **Sync Capacitor**: `npm run build && npx cap sync`
3. **Run on device**: `npx cap run android` or `npx cap run ios`

## Production Build

For production release:

1. Ensure configuration in `capacitor.config.ts`:
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.manolo.noxai',
     appName: 'NOX AI',
     webDir: 'dist',
     server: {
       androidScheme: 'http',
       cleartext: true
     },
   };
   ```

2. Build and sync:
   ```bash
   npm run build
   npx cap sync
   ```

3. Build APK/IPA through Android Studio/Xcode or run `./deploy-android.sh`

## Native Features

NOX AI integrates:
- Sound pattern detection (Web Audio API)
- Real voice recognition & synthesis (Web Speech API)
- Android App launcher & media intents
- OpenWeatherMap integration
- Bluetooth BLE audio synchronization

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Clean and rebuild: `npm run build && npx cap sync`

### Android Studio Issues
- Update Android Studio to latest version
- Sync Gradle files
- Invalidate caches: **File > Invalidate Caches / Restart**

### iOS Code Signing
- Configure your Apple Developer account in Xcode
- Select appropriate provisioning profile

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
- [Xcode Download](https://developer.apple.com/xcode/)
