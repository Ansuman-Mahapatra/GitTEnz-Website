# GitTEnz Frontend

This is the frontend application for GitTEnz, built with React, Vite, and Shadcn UI.

## Project Info

**URL**: [https://gittenz.netlify.app](https://gittenz.netlify.app)

## Getting Started

### Prerequisites

- Node.js v18+ and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Backend must be running (Spring Boot on `http://localhost:8080`)

### Setup

1. Install dependencies:

```sh
npm install
```

2. Configure environment variables:

```sh
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
VITE_DEVELOPER_LINKEDIN_URL=https://www.linkedin.com/in/yourprofile/
VITE_DEVELOPER_GITHUB_URL=https://github.com/yourusername
VITE_DEVELOPER_EMAIL=developer@example.com
```

3. Start the development server:

```sh
npm run dev
```

Frontend runs on **http://localhost:5180**

### Starting the Backend

```sh
cd ../backend
.\run-backend.ps1       # Windows
./mvnw spring-boot:run  # Linux/Mac
```

---

## Features

- **Matrix Green Theme**: A futuristic, high-performance design system
- **Tiled Lightning Background**: Immersive custom GLSL shader with dynamic reactive lighting
- **Smart Server Wake-Up**: Transparent 800ms fast-ping — skips loading screen when backend is already up (local dev), shows animated wake-up UI for Render cold starts only
- **Multi-Route Landing Experience**: High-energy and immersive pages for Home (`/`), Features (`/features`), Desktop Download (`/download`), and Developer About (`/about`)
- **Living UI**: Interactive particles, a custom Nav/Footer, and glassmorphism across every page
- **Email Signup**: No OTP required — user clicks "Check" to confirm email availability, then signs up directly. Admin verifies emails manually within a week.
- **OAuth2 Login**: Secure authentication with GitHub
- **Dashboard**: View repository stats (Stars, Forks, Languages) and Recent Activity
- **Activity Feed**: Real-time updates of your GitHub actions with multi-commit details
- **Repository Management**:
  - View code, branches, and commits
  - **File Tree**: Explore your project structure hierarchically
  - **Code Editor**: View and edit files with syntax highlighting
  - **Local Repos**: Select and view local folders securely
- **AI Assistant**: Chat with your codebase contextually

---

## Technologies

- **Vite & React 18**
- **Three.js & Custom GLSL** (Background Shaders)
- **TypeScript**
- **framer-motion** (Animations)
- **shadcn-ui & Tailwind CSS**
- **Spring Boot 3** (Backend)
- **MongoDB Atlas** (Database)

---

## Key Components

| Component      | Location                 | Description                                                                  |
| -------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `ServerWakeUp` | `src/components/layout/` | Smart server health checker — skips overlay if backend responds within 800ms |
| `SignupPage`   | `src/pages/`             | Email availability check only (no OTP sent), account created immediately     |
| `LoginPage`    | `src/pages/`             | GitHub OAuth + admin username/password login                                 |
| `AIAssistant`  | `src/components/ai/`     | Context-aware chat powered by OpenAI                                         |

---

## How can I deploy this project?

Please refer to the detailed [`DEPLOYMENT.md`](../DEPLOYMENT.md) in the root directory for instructions on deploying both the frontend and backend.
