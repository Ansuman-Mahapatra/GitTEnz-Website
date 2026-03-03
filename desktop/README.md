# GitTEnz Desktop

This is the Electron-based desktop application for GitTEnz. It wraps the React frontend in a native cross-platform executable, allowing you to run GitTEnz as a desktop app without opening a browser.

---

## Prerequisites

- Node.js v18+ and npm
- Backend must be running (`http://localhost:8080` by default)
- Frontend dev server must be running (`http://localhost:5180`) for development mode

---

## Development Mode

1. **Start the backend** (Spring Boot):

   ```bash
   cd ../backend
   .\run-backend.ps1         # Windows
   ./mvnw spring-boot:run    # Linux/Mac
   ```

2. **Start the frontend dev server:**

   ```bash
   cd ../frontend
   npm run dev
   ```

3. **Start the desktop app:**
   ```bash
   cd desktop
   npm start
   ```

The Electron app will open and load the Vite dev server at `http://localhost:5180`.

> **Note:** The smart `ServerWakeUp` component runs on startup. If the backend responds within 800ms, no loading screen is shown. For cold starts, an animated wake-up screen appears until the server is ready.

---

## Building for Production

The production build bundles the entire React app into the executable — no dev server needed.

### Step 1: Build the Frontend for Electron

```bash
cd ../frontend
npx vite build --mode electron
```

This creates `frontend/dist/` with relative `file://` paths compatible with Electron's file protocol.

### Step 2: Package the Desktop App

```bash
cd ../desktop
npm run dist
```

The installer/executable will be output to `desktop/dist/`:

- **Windows**: `.exe` installer
- **macOS**: `.dmg`
- **Linux**: `.AppImage`

---

## Configuration

### Backend URL

The desktop app's backend URL is configured in `frontend/.env.electron`:

```env
VITE_API_URL=http://localhost:8080
```

Update this to point to your production backend URL if packaging for distribution:

```env
VITE_API_URL=https://your-backend.onrender.com
```

### Rebuild After Config Changes

If you change the `.env.electron` file, rebuild the frontend before re-packaging:

```bash
cd ../frontend
npx vite build --mode electron
cd ../desktop
npm run dist
```

---

## Known Limitations

- **No SMTP required** — The signup flow uses email availability check only (no OTP sent), so the desktop app works fully offline except for GitHub OAuth and AI features
- **Admin OTP emails** require a working internet connection and Gmail SMTP configured in backend `.env`
- **GitHub OAuth** requires the backend to be reachable from the machine running the desktop app

---

## Distribution

For distributing the desktop app to others, ensure:

1. The packaged executable points to your production backend (`VITE_API_URL` in `.env.electron`)
2. The production backend is deployed and accessible
3. GitHub OAuth callback URL is updated in GitHub Developer Settings to the production backend URL
