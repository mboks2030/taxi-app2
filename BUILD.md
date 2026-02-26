# Taxi Business Management System - Build Guide

## Prerequisites

Before building, ensure you have the following installed:

- **Node.js** (v18+): [https://nodejs.org/](https://nodejs.org/)
- **npm** (v9+): Comes with Node.js
- **Android Studio** (for APK): [https://developer.android.com/studio](https://developer.android.com/studio)
  - SDK Platform: Android API 33+
  - SDK Build-Tools: 33.0.0+
- **Java JDK 17**: Required for Android builds
- **Windows 11** (for .exe): This project targets Windows

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build production web bundle
npm run build

# Run tests
npm test

# Build Windows installer (.exe)
npm run build-electron

# Build Android (after initial setup)
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## 1. Android APK Build (Capacitor)

### Initial Setup (One-Time)

```bash
# 1. Install dependencies (if not already)
npm install

# 2. Build the React app production bundle
npm run build

# 3. Add Android platform (if not already added)
npx cap add android

# 4. Copy web assets to Android project
npx cap copy android

# 5. Sync plugins and dependencies
npx cap sync android
```

### Build APK

#### Option A: Using Android Studio (Recommended)

```bash
# Open project in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Command Line Build

```bash
# Navigate to android folder
cd android

# Build debug APK
./gradlew assembleDebug

# Build release APK (requires signing config)
./gradlew assembleRelease
```

**APK Output Locations:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Troubleshooting Android Builds

```bash
# Check Java version (must be 17)
java -version

# Set JAVA_HOME (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot"

# Set ANDROID_HOME (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

---

## 2. Windows Installer (.exe) Build (Electron)

### Build Process

```bash
# 1. Install dependencies (if not already)
npm install

# 2. Build the React app production bundle
npm run build

# 3. Build Windows installer with electron-builder
npm run build-electron
```

**This runs:** `node create-icon.js && npm run build && electron-builder --win --x64`

### Output Locations

After successful build, files appear in `dist/`:

- **NSIS Installer**: `dist/TaxiBusinessManagementSystem_Setup.exe`
- **Portable Executable**: `dist/TaxiBusinessManagementSystem_Setup.exe` (portable version)

### Alternative Build Methods

```bash
# Package only (no installer)
npm run package-win-stable

# Build with verbose logging
npx electron-builder --win --x64 --verbose

# Build for specific target only
npx electron-builder --win nsis --x64
```

### Troubleshooting Windows Builds

```bash
# Clear Electron cache
rmdir /s /q node_modules\.cache

# Clear electron-builder cache
rmdir /s /q %LOCALAPPDATA%\electron-builder\Cache

# Reinstall dependencies
rmdir /s /q node_modules
npm install

# Build with debug output
set DEBUG=electron-builder && npm run build-electron
```

---

## 3. Build Scripts (Automated)

### scripts/build-apk.sh (Bash/Git Bash)

```bash
#!/bin/bash
set -e
echo "🚀 Building Android APK..."

# Build React app
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

echo "✅ APK built successfully!"
echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
```

### scripts/build-windows.sh (PowerShell)

```powershell
# build-windows.ps1
Write-Host "🚀 Building Windows Installer..." -ForegroundColor Cyan

# Build React app and Electron
npm run build-electron

Write-Host "✅ Windows installer built successfully!" -ForegroundColor Green
Write-Host "📍 Location: dist/TaxiBusinessManagementSystem_Setup.exe" -ForegroundColor Yellow
```

---

## 4. Configuration Files Reference

### capacitor.config.json
```json
{
  "appId": "com.taxi.business.manager",
  "appName": "Taxi Business Management System",
  "webDir": "build",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

### package.json (Build Section)
```json
{
  "build": {
    "appId": "com.taxi.dashboard",
    "productName": "Taxi Business Management System",
    "directories": {
      "output": "dist",
      "buildResources": "build-resources"
    },
    "win": {
      "target": [{"target": "nsis", "arch": ["x64"]}],
      "icon": "build-resources/icon.ico"
    }
  }
}
```

---

## 5. Development Tips

### Run Development Server + Electron Together
```bash
npm run electron-dev
```

### Test Electron App Locally
```bash
npm run build
npm run electron-start
```

### Update Android After Code Changes
```bash
npm run build
npx cap copy android
npx cap sync android
```

---

## 6. Release Checklist

- [ ] Version bumped in `package.json`
- [ ] All tests passing (`npm test`)
- [ ] Production build successful (`npm run build`)
- [ ] Android APK tested on device
- [ ] Windows .exe tested on clean machine
- [ ] Firebase config is production-ready
- [ ] App icons present in `build-resources/`
