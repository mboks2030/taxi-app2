const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow = null;

// Disable GPU hardware acceleration to prevent PC-level freezes on Windows 11
app.disableHardwareAcceleration();

// Remove VA-API features which are for Linux and can cause issues on Windows
// app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');

// Handle uncaught exceptions to prevent app crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Log error but don't crash the app
    if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showErrorBox('Application Error',
            'An unexpected error occurred. The application will continue running.\n\n' +
            'Error: ' + error.message
        );
    }
});

// Prevent the app from being garbage collected
app.on('ready', () => {
    createWindow();
});

function createWindow() {
    // Create the browser window with enhanced settings for Windows 11
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "Taxi Business Manager",
        icon: path.join(__dirname, isDev ? 'public' : 'build-resources', 'icon.ico'),
        backgroundColor: '#1e293b', // Prevents white flash on load
        show: false, // Don't show until ready-to-show
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: true,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js'),
            // Disable DevTools in production
            devTools: isDev,
            nativeWindowOpen: true
        },
        // Windows 11 specific settings
        frame: true,
        transparent: false,
        hasShadow: true,
        roundedCorners: true // Works on Windows 11
    });

    // Commercial feature: Check for --minimized flag in the command line
    const isMinimized = process.argv.includes('--minimized');

    // Hide menu bar for cleaner interface
    mainWindow.setMenuBarVisibility(false);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        if (isMinimized) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    // Load the app
    const indexPath = path.join(__dirname, 'build', 'index.html');

    if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath).catch((err) => {
            console.error('Failed to load file:', err);
            showErrorPage('Failed to load application. Please reinstall.');
        });
    } else if (isDev) {
        // In development, try to load from dev server
        mainWindow.loadURL('http://localhost:3000').catch(() => {
            showErrorPage('Development server not running. Please run "npm start" first.');
        });
    } else {
        showErrorPage('Application files are missing. Please reinstall the application.');
    }

    // Handle crashes gracefully
    mainWindow.webContents.on('crashed', (event, killed) => {
        console.error('WebContents crashed:', { event, killed });

        const options = {
            type: 'error',
            title: 'Application Crashed',
            message: 'The application has crashed. Would you like to restart?',
            buttons: ['Restart', 'Close']
        };

        dialog.showMessageBox(mainWindow, options).then((result) => {
            if (result.response === 0) { // Restart
                app.relaunch();
                app.exit(0);
            } else {
                app.quit();
            }
        });
    });

    // Handle unresponsive pages
    mainWindow.webContents.on('unresponsive', () => {
        console.warn('WebContents became unresponsive');

        const options = {
            type: 'warning',
            title: 'Application Not Responding',
            message: 'The application is not responding. Would you like to wait or close?',
            buttons: ['Wait', 'Close']
        };

        dialog.showMessageBox(mainWindow, options).then((result) => {
            if (result.response === 1) { // Close
                mainWindow.destroy();
            }
        });
    });

    mainWindow.webContents.on('responsive', () => {
        console.log('WebContents became responsive again');
    });

    // Prevent navigation to external URLs for security, but allow Auth domains
    const allowedDomains = [
        'firebaseapp.com',
        'googleapis.com',
        'google.com',
        'gstatic.com',
        'firebase.google.com'
    ];

    mainWindow.webContents.on('will-navigate', (event, url) => {
        const appURL = mainWindow.webContents.getURL();
        const parsedUrl = new URL(url);

        // Allow same-origin or localhost
        if (url.startsWith(appURL) || url.startsWith('http://localhost')) {
            return;
        }

        // Allow Google Auth domains
        if (allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain))) {
            return;
        }

        event.preventDefault();
        console.warn('Prevented navigation to:', url);
    });

    // Handle external links and auth popups
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        const parsedUrl = new URL(url);

        // If it's an auth-related domain, allow it to open in a new window within the app
        if (allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain))) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 600,
                    height: 700,
                    autoHideMenuBar: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                }
            };
        }

        // For other external links, open in system browser
        if (url.startsWith('http://') || url.startsWith('https://')) {
            require('electron').shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Log when window is ready
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Application loaded successfully');
    });

    // Check for updates
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
}

autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version of the application is available. It will be downloaded in the background.'
    });
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Install and restart now?',
        buttons: ['Yes', 'Later']
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

function showErrorPage(message) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        const errorHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Error - Taxi Business Manager</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%);
                        color: white;
                    }
                    .error-container {
                        text-align: center;
                        padding: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    }
                    h1 { margin-bottom: 20px; }
                    p { font-size: 16px; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>⚠️ Error</h1>
                    <p>${message}</p>
                </div>
            </body>
            </html>
        `;
        mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHTML));
    }
}

// Single instance lock - prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, focus our window
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS, apps typically stay open until explicitly quit
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Clean up before quitting
app.on('before-quit', () => {
    console.log('Application is quitting...');
});

// Disable error dialogs in production
if (!isDev) {
    app.on('render-process-gone', (event, webContents, details) => {
        console.error('Render process gone:', details);
    });
}
