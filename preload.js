const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "electronAPI", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ["toMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain"];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    // For commercial apps, we can expose app version or status
    getAppVersion: () => process.env.npm_package_version,
    isProduction: () => process.env.NODE_ENV === 'production'
}
);
