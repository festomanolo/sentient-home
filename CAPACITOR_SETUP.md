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

// [NOX-DEV-36]: ongoing module refinement
