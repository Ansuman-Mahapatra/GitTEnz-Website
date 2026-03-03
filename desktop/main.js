const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

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
      sandbox: false,           // Keep false so preload can run
      webSecurity: false,       // Allow loading local assets from file:// in production
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
    // In development, load the Vite dev server (desktop uses port 5173)
    win.loadURL('http://localhost:5173').catch((err) => {
      console.error('Could not connect to Vite dev server:', err.message);
      console.error('Make sure to run the desktop Vite dev server first: npm run dev:vite');
    });
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load the built index.html
    win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch((err) => {
      console.error('Could not load production build:', err.message);
      console.error('Make sure to build first: npm run build');
    });
  }

  // Show window only when ready to avoid white/blank flash
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open external links (http/https) in the default system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Also handle navigations to external URLs
  win.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    // Allow localhost (Vite dev server) and file:// protocol
    if (parsedUrl.hostname !== 'localhost' && parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS re-create window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS apps stay open until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
