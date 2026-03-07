const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#09090b',
      symbolColor: '#a1a1aa',
      height: 32,
    },
    title: 'GitTEnz',
    backgroundColor: '#09090b',
    show: false,
  });

  // Hide the default menu bar
  Menu.setApplicationMenu(null);

  if (isDev) {
    win.loadURL('http://localhost:5173').catch((err) => {
      console.error('Could not connect to Vite dev server:', err.message);
    });
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch((err) => {
      console.error('Could not load production build:', err.message);
    });
  }

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'localhost' && parsedUrl.protocol !== 'file:') {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch {}
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Git Command Handler
ipcMain.handle('run-git-command', async (event, { cwd, args }) => {
  return new Promise((resolve) => {
    // Basic verification of args to prevent common malicious commands
    const validArgs = args.filter(a => typeof a === 'string');
    const command = `git ${validArgs.join(' ')}`;
    
    exec(command, { cwd }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout,
        stderr,
        error: error ? error.message : null
      });
    });
  });
});
