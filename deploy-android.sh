#!/bin/bash

# NOX AI - Android Deployment Script
# This script builds and deploys NOX AI to Android devices

set -e

echo "🤖 NOX AI - Android Deployment Script"
echo "======================================"

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        echo "❌ npx is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Build the web app
build_web_app() {
    echo "🏗️  Building web application..."
    npm run build
    echo "✅ Web app built successfully"
}

# Initialize Capacitor (if not already done)
init_capacitor() {
    echo "⚡ Initializing Capacitor..."
    
    if [ ! -d "android" ]; then
        echo "📱 Adding Android platform..."
        npx cap add android
    else
        echo "📱 Android platform already exists"
    fi
    
    echo "✅ Capacitor initialized"
}

# Sync Capacitor
sync_capacitor() {
    echo "🔄 Syncing Capacitor..."
    npx cap sync android
    echo "✅ Capacitor synced"
}

# Configure Android permissions
configure_permissions() {
    echo "🔐 Configuring Android permissions..."
    
    MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"
    
    if [ -f "$MANIFEST_FILE" ]; then
        # Check if permissions are already added
        if ! grep -q "RECORD_AUDIO" "$MANIFEST_FILE"; then
            echo "Adding required permissions to AndroidManifest.xml..."
            
            # Create a backup
            cp "$MANIFEST_FILE" "$MANIFEST_FILE.backup"
            
            # Add permissions before the application tag
            sed -i '/<application/i\
    <!-- NOX AI Permissions -->\
    <uses-permission android:name="android.permission.RECORD_AUDIO" />\
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\
    <uses-permission android:name="android.permission.BLUETOOTH" />\
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />\
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />\
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\
    <uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />\
    <uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />\
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />' "$MANIFEST_FILE"
            
            echo "✅ Permissions added to AndroidManifest.xml"
        else
            echo "✅ Permissions already configured"
        fi
    else
        echo "⚠️  AndroidManifest.xml not found. Please run 'npx cap add android' first."
    fi
}

# Build APK
build_apk() {
    echo "📱 Building Android APK..."
    
    if [ -d "android" ]; then
        cd android
        
        # Build debug APK
        echo "🔨 Building debug APK..."
        ./gradlew assembleDebug
        
        # Check if build was successful
        if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            echo "✅ Debug APK built successfully!"
            echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
        else
            echo "❌ Failed to build APK"
            exit 1
        fi
        
        cd ..
    else
        echo "❌ Android directory not found. Please run the full setup first."
        exit 1
    fi
}

# Install APK on connected device
install_apk() {
    echo "📲 Installing APK on connected device..."
    
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    
    if [ -f "$APK_PATH" ]; then
        # Check if adb is available
        if command -v adb &> /dev/null; then
            # Check if device is connected
            if adb devices | grep -q "device$"; then
                echo "📱 Installing APK..."
                adb install -r "$APK_PATH"
                echo "✅ APK installed successfully!"
                echo "🚀 You can now launch NOX AI on your Android device"
            else
                echo "⚠️  No Android device connected via ADB"
                echo "💡 Connect your device and enable USB debugging, then run:"
                echo "   adb install -r $APK_PATH"
            fi
        else
            echo "⚠️  ADB not found. Please install Android SDK Platform Tools"
            echo "💡 You can manually install the APK from: $APK_PATH"
        fi
    else
        echo "❌ APK not found. Please build the APK first."
        exit 1
    fi
}

# Open Android Studio
open_android_studio() {
    echo "🎨 Opening Android Studio..."
    npx cap open android
}

# Main deployment function
deploy() {
    echo "🚀 Starting full deployment process..."
    
    check_requirements
    install_dependencies
    build_web_app
    init_capacitor
    sync_capacitor
    configure_permissions
    
    echo ""
    echo "🎯 Deployment options:"
    echo "1. Build APK only"
    echo "2. Build and install APK"
    echo "3. Open in Android Studio"
    echo "4. All of the above"
    
    read -p "Choose an option (1-4): " choice
    
    case $choice in
        1)
            build_apk
            ;;
        2)
            build_apk
            install_apk
            ;;
        3)
            open_android_studio
            ;;
        4)
            build_apk
            install_apk
            open_android_studio
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
}

# Development mode
dev_mode() {
    echo "🔧 Starting development mode..."
    
    check_requirements
    install_dependencies
    init_capacitor
    sync_capacitor
    configure_permissions
    
    echo "🎨 Opening Android Studio for development..."
    npx cap open android
    
    echo ""
    echo "💡 Development Tips:"
    echo "   - Make changes in your code editor"
    echo "   - Run 'npm run build && npx cap sync' to update"
    echo "   - Use Android Studio to build and test"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy    Full deployment process (default)"
    echo "  dev       Development mode setup"
    echo "  build     Build web app and sync"
    echo "  apk       Build APK only"
    echo "  install   Install APK on device"
    echo "  studio    Open Android Studio"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Full deployment"
    echo "  $0 dev       # Development setup"
    echo "  $0 apk       # Build APK only"
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    dev)
        dev_mode
        ;;
    build)
        check_requirements
        install_dependencies
        build_web_app
        sync_capacitor
        ;;
    apk)
        build_apk
        ;;
    install)
        install_apk
        ;;
    studio)
        open_android_studio
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        usage
        exit 1
        ;;
esac

echo ""
echo "🎉 NOX AI deployment script completed!"
echo "📚 For more information, check the SETUP_GUIDE.md file"