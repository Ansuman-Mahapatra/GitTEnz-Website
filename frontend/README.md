# GitTEnz Frontend

The React + Vite frontend for the [GitTEnz](https://gittenz.vercel.app) platform.

**Live URL:** [https://gittenz.vercel.app](https://gittenz.vercel.app)

---

## Getting Started

### Prerequisites

- Node.js v18+ and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Backend must be running (Spring Boot on `http://localhost:8080`)

### Setup

```sh
npm install
```

Configure environment variables:

```env
# frontend/.env — used by local development (npm run dev)
VITE_API_URL=http://localhost:8080
VITE_DEVELOPER_LINKEDIN_URL=https://www.linkedin.com/in/ansumanmahapatra998/
VITE_DEVELOPER_GITHUB_URL=https://github.com/Ansuman-Mahapatra
VITE_DEVELOPER_EMAIL=ansuman197463@gmail.com
```

```env
# frontend/.env.production — used automatically by production builds and Vercel
VITE_API_URL=https://gittenz.onrender.com
```

Start the development server:

```sh
npm run dev
```

Frontend runs on **http://localhost:5180**

---

## Features

- **Matrix Green Theme** — A futuristic, high-contrast design system with neon accents
- **Tiled Lightning Background** — Custom GLSL shader with dynamic reactive lighting
- **Smart Server Wake-Up** — Skips loading screen if backend responds within 800ms (local dev); shows animated wake-up UI for Render cold starts only
- **Deleted Repository Tracking** — Repositories removed from GitHub are auto-detected and moved to a "Deleted Repos" section with deletion dates
- **Manual Sync Button** — "Sync Data" button in the dashboard header forces a live re-sync with GitHub
- **Desktop App Download** — Direct download button in the sidebar for the GitDense `.exe` installer
- **Email Signup** — No OTP required. User confirms email availability, signs up directly. Admin verifies emails within a week.
- **OAuth2 GitHub Login** — Secure GitHub authentication with smart redirect per client app
- **Dashboard** — Repository stats (Stars, Forks, Languages) and recent activity
- **Activity Feed** — Real-time GitHub action updates with commit details
- **Theme Engine** — Native Light & Dark mode support implemented via `next-themes` and a centralized settings dashboard.
- **Repository Management** — File tree, code viewer/editor, branch/commit history, local repos
- **AI Analytics** — Generate comprehensive repository structural reports and executive summaries directly from the UI.
- **Inline AI Assistant** — Powerful contextual popups directly over the CodeEditor allowing instantaneous explanation, bug tracking, and refactoring connected to Nvidia/OpenAI models.

---

## Key Components

| Component | Location | Description |
|---|---|---|
| `DashboardPage` | `src/pages/` | Main dashboard with repos, deleted repos, activity, and sync button |
| `Sidebar` | `src/components/layout/` | Navigation with all tabs including Deleted Repos and Desktop download link |
| `ServerWakeUp` | `src/components/layout/` | Smart backend health checker |
| `SignupPage` | `src/pages/` | Email availability check, immediate account creation |
| `LoginPage` | `src/pages/` | GitHub OAuth + email/password login |
| `CodeEditor` | `src/components/dashboard/` | Core text editor powering Inline AI highlighting plugins |
| `SettingsPanel` | `src/components/settings/` | Unified configuration hub for Themes, Notifications, and user configs |
| `InlineAiProvider` | `src/components/ai/` | Text-highlight driven context-aware chat (reads exact specific code snippets) |

---

## Environment Variable Strategy

Vite automatically selects the correct `.env` file:

| Command | Env File Used | Backend Target |
|---|---|---|
| `npm run dev` | `.env` | `http://localhost:8080` |
| `npm run build` | `.env.production` | `https://gittenz.onrender.com` |
| Vercel deploy | `.env.production` | `https://gittenz.onrender.com` |

---

## Technologies

- **Vite & React 18** — App framework and build tool
- **TypeScript** — Type-safe development
- **Tailwind CSS + Shadcn UI** — Styling and components
- **TanStack Query** — Server state management and caching
- **Three.js & Custom GLSL** — WebGL background shaders
- **Framer Motion** — Smooth UI animations
- **Lucide React** — Consistent icons

---

## Deployment

See [`DEPLOYMENT.md`](../DEPLOYMENT.md) for full instructions on deploying frontend to Vercel and backend to Render.
