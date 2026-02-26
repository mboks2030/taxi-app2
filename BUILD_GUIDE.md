# Building Taxi Business Manager for Windows 11

## Prerequisites
- Node.js 16 or higher installed
- Windows 10/11 operating system
- At least 2GB free disk space

## Build Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Windows Installer
```bash
npm run package-win
```

This command will:
1. Create the application icon (icon.ico)
2. Build the React application
3. Package it with Electron
4. Create a Windows installer (.exe)

### Step 3: Find Your Installer
After the build completes successfully, you'll find the installer at:
```
dist/Taxi Business Manager-Setup-1.0.0.exe
```

## Installation

1. Double-click the `Taxi Business Manager-Setup-1.0.0.exe` file
2. Choose your installation directory (or use the default)
3. The installer will create:
   - Desktop shortcut
   - Start Menu shortcut
4. Click "Finish" to launch the application

## Uninstallation

To remove the application:
1. Go to Windows Settings > Apps > Installed Apps
2. Find "Taxi Business Manager"
3. Click the three dots and select "Uninstall"

## Troubleshooting

### Build Fails
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rmdir /s node_modules && npm install`
- Make sure you have enough disk space

### App Won't Start
- Try running as administrator (right-click > Run as administrator)
- Check Windows Defender or antivirus isn't blocking it
- Reinstall the application

### Firewall Warnings
- If Windows Firewall prompts, click "Allow access"
- The app uses Firebase for data sync (if configured)

### Performance Issues & Freezes
- **App Freezes PC**: This is often due to GPU hardware acceleration issues on some Windows 11 configurations. I have optimized the build to be lighter. If it still freezes, you can try:
  1. Open `main.js`
  2. Uncomment the line `app.disableHardwareAcceleration();` (remove the `//` at the start)
  3. Rebuild the application
- Close other heavy applications
- Make sure your Windows 11 is up to date
- Check if you have at least 4GB RAM available
- The new installer is much smaller (optimized from ~150MB to ~70MB) which should help with performance.

## Technical Details

- **Application ID**: com.taxi.dashboard
- **Product Name**: Taxi Business Manager
- **Version**: 1.0.0
- **Target**: Windows 10/11 (64-bit)
- **Installer Type**: NSIS (Nullsoft Scriptable Install System)
- **Framework**: Electron + React

## Data Storage

The application stores data locally in:
```
%APPDATA%/taxi-dashboard/
```

This includes:
- Application settings
- Local database (Dexie/IndexedDB)
- Cache files

## Updates

Currently, the application does not have auto-update functionality.
To update to a newer version:
1. Download the new installer
2. Run it (it will upgrade the existing installation)

## Building for Distribution

If you want to distribute this application:

1. **Code Signing** (Recommended for production):
   - Obtain a code signing certificate
   - Configure in package.json under `win.certificateFile`
   - This prevents Windows SmartScreen warnings

2. **Custom Installer**:
   - Modify `package.json` > `build` > `nsis` section
   - Customize colors, images, and installation steps

3. **Multiple Architectures**:
   - To build for 32-bit: `electron-builder --win --ia32`
   - To build both: `electron-builder --win --x64 --ia32`

## Security Notes

- The app runs with standard user privileges (asInvoker)
- No elevation required for normal operation
- Data is stored locally on the user's machine
- Firebase credentials should be kept secure (see config.js)

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in the console
3. Check Windows Event Viewer for crash logs

---

**Last Updated**: 2026-01-27
**Build Version**: 1.0.0
