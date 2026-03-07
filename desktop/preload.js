const { contextBridge } = require('electron');

// Expose minimal APIs to the renderer if needed in the future
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
