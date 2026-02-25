const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    titleBarStyle: 'hidden', // Make it look modern/custom if desired, or 'default'
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#74b1be',
      height: 30
    },
    title: 'GitTEnz'
  });

  // Remove the menu bar for a cleaner look (optional, can be toggleable)
  win.setMenuBarVisibility(false);

  if (isDev) {
    // In development, load the local Vite server
    // User must define the port or ensure it's 5173/5180. 
    // We try 5180 based on vite.config.ts
    win.loadURL('http://localhost:5180');
    win.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    // We assume the build output is in a 'dist' folder relative to this file
    // Note: You might need to adjust relative paths depending on how you structure the build
    // For this simple plan, we assume we will copy ../frontend/dist here or reference it
    win.loadFile(path.join(__dirname, '../frontend/dist/index.html')).catch(() => {
        // Fallback or error handling
        console.log('Could not find index.html. Make sure to build the frontend first.');
    });
  }

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
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
