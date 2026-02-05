# GitTEnz Frontend Documentation

## Overview
The frontend of GitTEnz is a modern Single Page Application (SPA) built with **React** and **TypeScript**. It focuses on providing a premium, highly responsive user experience with glassmorphism aesthetics, smooth animations, and real-time interactions.

## Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite (for fast HMR and building)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI (Components), Framer Motion (Animations)
- **State Management**: TanStack Query (React Query) for server state.
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/  # Repo cards, Activity feed, Charts
│   │   ├── editor/     # Code editor/viewer components
│   │   ├── layout/     # Sidebar, Navbar
│   │   ├── ui/         # Reusable Shadcn UI components (Buttons, Inputs, etc.)
│   ├── lib/            # Utilities (auth context, API helpers)
│   ├── pages/          # Main route views (Dashboard, Login, RepoDetail)
```

## Key Features & Components

### 1. Authentication (`src/lib/auth.tsx`)
- Managed via `AuthContext`.
- Supports both **GitHub OAuth** redirects and **Email/Password** login.
- Persists JWT tokens in `localStorage`.
- Includes `ProtectedRoute` and `PublicRoute` wrappers in `App.tsx` for access control.

### 2. Dashboard (`DashboardPage.tsx`)
The central hub for the user, featuring:
- **Stats Overview**: Total repos, pushes, PRs.
- **Activity Charts**: Visualizing commit history using Recharts.
- **Repository Lists**: View for Remote, Local, and Starred repositories.
- **Local Repo Access**: Uses the **File System Access API** to securely read/write to local folders directly from the browser without uploading code.

### 3. Repository Detail View (`RepositoryDetailPage.tsx`)
- **File Explorer**: Recursive tree view of the repository structure.
- **Code Editor**: A syntax-highlighted editor allowing users to modify files.
- **Git Operations**: UI to switch branches, create new branches, and commit changes.
- **Tabs**: Switch between Code, Commit History, and Branches.

### 4. Local Repository Management (`LocalRepoViewer.tsx`)
- Bridges the browser and local file system.
- Allows "selecting" a folder to view it as a repository within the app.
- Reads `.git` metadata locally where possible.

### 5. AI Assistant (`AIAssistant.tsx`)
- A floating, interactive chat interface available globally.
- Sends user queries to the backend AI service.
- Displays formatted markdown responses.

## Styling System
- **Theme**: Dark mode by default, utilizing CSS variables (in `index.css`) for easy theming.
- **Glassmorphism**: Heavy use of `backdrop-blur`, semi-transparent backgrounds (`bg-black/40`), and subtle borders (`border-white/10`) to create depth.
- **Animations**: `Framer-motion` is used for page transitions, modal appearances, and list loading staggers.

## Running Locally
```bash
# Install dependencies
npm install

# Start Dev Server
npm run dev
```
The app usually runs on `http://localhost:5173`.
