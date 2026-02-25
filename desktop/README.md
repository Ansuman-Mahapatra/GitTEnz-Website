# GitTEnz Desktop

This is the Electron-based desktop application for GitTEnz.

## Prerequisites

- Frontend must be built for Electron mode.
- Backend must be running (default: http://localhost:8080).

## Development

1.  Start the backend (Spring Boot).
2.  Start the frontend:
    ```bash
    cd ../frontend
    npm run dev
    ```
3.  Start the desktop app:
    ```bash
    cd desktop
    npm start
    ```

## Building for Production

1.  Build the frontend for Electron:
    ```bash
    cd ../frontend
    npx vite build --mode electron
    # This creates the dist folder with relative paths suited for file:// protocol.
    ```
2.  Package the desktop app:
    ```bash
    cd ../desktop
    npm run dist
    ```
    The executable will be in `desktop/dist` folder.

## Configuration

- The backend URL is configured in `frontend/.env.electron`. Default is `http://localhost:8080`.
