const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        on: (channel, callback) => {
            const subscription = (event, ...args) => callback(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    }
});

contextBridge.exposeInMainWorld('notification', {
    show: (title, body) => ipcRenderer.invoke('show-notification', { title, body })
});

contextBridge.exposeInMainWorld('windowControl', {
    toggleAlwaysOnTop: flag => ipcRenderer.invoke('toggle-always-on-top', flag)
});

// ...existing code...

