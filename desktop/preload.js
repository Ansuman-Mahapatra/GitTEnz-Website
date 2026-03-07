const { contextBridge, ipcRenderer } = require('electron');

// Expose minimal APIs to the renderer if needed in the future
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  runGitCommand: (cwd, args) => ipcRenderer.invoke('run-git-command', { cwd, args }),
});
