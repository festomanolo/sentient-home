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

// [NOX-DEV-83]: ongoing module refinement
