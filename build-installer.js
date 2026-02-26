const electronInstaller = require('electron-winstaller');
const path = require('path');
const fs = require('fs');

async function build() {
    const appDir = path.join(__dirname, 'dist', 'TaxiManager-win32-x64');
    const outDir = path.join(__dirname, 'dist', 'installers');
    const tmpDir = 'C:\\t';

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    console.log('Starting installer build from:', appDir);
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: appDir,
            outputDirectory: outDir,
            authors: 'Taxi',
            exe: 'TaxiManager.exe',
            setupExe: 'TaxiBusinessManager_Setup.exe',
            noMsi: true,
            title: 'Taxi Business Management System',
            description: 'Taxi Business Management Dashboard'
        });
        console.log('Installer created successfully in dist/installers');
    } catch (e) {
        console.error('Failed to create installer:', e.message);
        process.exit(1);
    }
}

build();
