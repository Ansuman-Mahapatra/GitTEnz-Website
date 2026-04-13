# GitTEnz — Advanced GitHub Dashboard

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://gittenz.vercel.app)
[![Desktop App](https://img.shields.io/badge/Desktop-GitDense-blue?style=for-the-badge)](https://github.com/Ansuman-Mahapatra/GitDense)
[![Backend](https://img.shields.io/badge/API-Render-orange?style=for-the-badge)](https://gittenz.onrender.com/api/public/health)

GitTEnz is a high-performance, full-stack web application for GitHub developers. It provides a living, interactive dashboard with AI-powered assistance, secure admin authentication, repository insights, and deleted repository tracking. Available as both a **web app** at [gittenz.vercel.app](https://gittenz.vercel.app) and a native **Electron desktop app** called [GitDense](https://github.com/Ansuman-Mahapatra/GitDense). Built with React, Spring Boot, and MongoDB.

---

## 🚀 Features

### **Core Features**

- **GitHub OAuth Integration** — Seamless login to sync repositories and view stats
- **Email/Password Signup** — Create accounts directly, admin verifies emails within a week
- **Deleted Repository Tracking** — Repositories removed from GitHub are automatically detected and moved to a "Deleted Repos" section, preserving history
- **Manual Sync** — One-click "Sync Data" button in the dashboard to pull the latest repository state from GitHub anytime
- **AI Repository Analysts & Insights** — Brand-new deep parsing of repositories offering Collaboration metrics, Executive Summaries, and calculated Health/Security scores.
- **Custom Insight Downloads** — Automatically exports formatted `.md` analysis reports for GitHub repositories.
- **Admin Dashboard** — Comprehensive panel with user management, analytics, feedback, and policy management
- **Admin OTP Authentication** — Two-factor login via Gmail SMTP for admin accounts only
- **Advanced Context-Aware AI Assistant** — Highlight text in the code editor to get instant "Explain", "Find Bugs", or "Suggest Refactor" prompts directly connected to OpenAI/Nvidia models.
- **Activity Insights** — Contribution history with charts for Pushes, Pull Requests, and more
- **Local Starring** — Star repositories within GitTEnz without affecting GitHub stars
- **Code Editor** — View and edit code directly in the browser with a file tree
- **Theme Customization** — Full Light/Dark mode (`next-themes`) synchronized seamlessly through localized central Settings.
- **Desktop App (GitDense)** — Full Electron wrapper with persistent 30-day+ sessions, and smart `gitdense://` deep-linking for seamless OAuth web-to-desktop transitions.

### **Admin Features**

- **User Management** — View, manage, reset passwords for all users
- **Email Verification Queue** — View unverified users (`GET /api/admin/users/unverified`) and approve them
- **Analytics Dashboard** — Visual insights on user growth and system usage
- **Feedback System** — Collect and manage user feedback
- **Privacy Policy & Terms** — Manage and update policy documents

### **UI/UX & Aesthetics**

- **Matrix Green Theme** (Website) — High-contrast emerald and black design with neon accents
- **Light Blue Theme** (Desktop GitDense) — Distinct, calm blue palette that differentiates the desktop experience
- **Tiled Lightning Surface** — Custom WebGL (GLSL) shader background
- **Smart Server Wake-Up** — Instantly passes through locally (<800ms); shows animated UI for Render cold-starts
- **Premium Glassmorphism** — High-blur cards and interfaces
- **Fluid Animations** — Powered by Framer Motion
- **Living Particle System** — Dynamic particles on every page
- **Dark Mode Native** — Immersive dark environment optimized for developers
- **Mobile Optimized** — Fully responsive grid

---

## 🛠️ Tech Stack

### **Frontend (Website)**

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | Core UI framework |
| Vite | Build tool |
| Tailwind CSS + Shadcn UI | Styling & components |
| TanStack Query | Server state management |
| React Router | Client-side routing |
| Framer Motion | Animations |
| Three.js & GLSL | WebGL shader backgrounds |
| Lucide React | Iconography |

### **Backend**

| Tool | Purpose |
|---|---|
| Spring Boot 3 (Java 17+) | API framework |
| Spring Security | OAuth2 + JWT authentication |
| Spring Data MongoDB | Database integration |
| Spring Mail | Gmail SMTP for admin OTP only |
| RestTemplate | GitHub API calls |
| Maven | Dependency management |

### **Desktop (GitDense)**

| Tool | Purpose |
|---|---|
| Electron | Native app wrapper |
| Vite + React | UI rendering |
| `electron-builder` | NSIS one-click installer |

### **Infrastructure**

| Service | Purpose |
|---|---|
| MongoDB Atlas | Primary database |
| Redis | Caching layer (optional) |
| GitHub API | Repository data source |
| OpenAI & NVIDIA API | AI assistance and LLM repository Insights |
| Gmail SMTP | Admin OTP delivery |
| Render | Backend deployment |
| Vercel | Frontend deployment |

---

## ⚙️ Prerequisites

- **Java 17+** (JDK 21 recommended)
- **Node.js** v18 or higher
- **Maven** 3.6+
- **MongoDB Atlas Account**
- **Gmail Account** with App Password (admin OTP only)
- **GitHub OAuth App** (for OAuth login)
- **OpenAI API Key** (for AI features)

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ansuman-Mahapatra/GitTEnz-Website.git
cd GitTEnz
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env    # Fill in your credentials
```

Key variables for `backend/.env`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# LLM & AI 
OPENAI_API_KEY=sk-your_openai_key
# OR optionally override with an NVIDIA NIM key starting with nvapi-
# NVIDIA_API_KEY=nvapi-your_nvidia_key

# MongoDB Atlas
SPRING_DATA_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gitten

# Frontend URL (used for OAuth redirect fallback)
FRONTEND_URL=https://gittenz.vercel.app

# Gmail SMTP (admin OTP only)
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_16_char_app_password

# Admin & JWT
ADMIN_INITIAL_EMAIL=admin@example.com
JWT_SECRET_KEY=your_64_char_hex_secret
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

The `frontend/.env` file controls the local backend target:

```env
# For local development (talks to local backend)
VITE_API_URL=http://localhost:8080
```

The `frontend/.env.production` file controls the production build:

```env
# For production deployment (talks to cloud backend)
VITE_API_URL=https://gittenz.onrender.com
```

---

## ▶️ Running the Application

### Start Backend (Terminal 1):

```bash
cd backend

# Windows
.\run-backend.ps1

# Linux/Mac
./mvnw spring-boot:run
```

**Backend runs on:** `http://localhost:8080`

### Start Frontend (Terminal 2):

```bash
cd frontend
npm run dev
```

**Frontend runs on:** `http://localhost:5180`

---

## 🖥️ Desktop App (GitDense)

The desktop app is maintained in a separate repository: **[Ansuman-Mahapatra/GitDense](https://github.com/Ansuman-Mahapatra/GitDense)**

### Download the Installer

Download the latest Windows installer (`GitDense-Setup-1.0.0.exe`) directly from the GitDense GitHub repository or from the in-app download button on the website.

### Development (Web View)

```bash
cd GitDense
npm install
npx vite --force --port 5175 --host 0.0.0.0
```

Open `http://localhost:5175` in your browser. The `.env` file controls the backend:

```env
# .env (development — talks to cloud backend)
VITE_API_URL=https://gittenz.onrender.com

# .env.production (packaged .exe — talks to cloud backend)
VITE_API_URL=https://gittenz.onrender.com
```

### Build the Installer

```bash
cd GitDense
npm run dist
```

Output: `GitDense/dist-electron/GitDense-Setup-1.0.0.exe`

### Desktop App Architecture Highlights

- **Light Blue Theme**: Desktop has its own distinct design to differ from the website
- **Persistent Sessions**: Users stay logged in permanently until they manually sign out (no 30-day inactivity logout). JWT tokens are valid for 10 years.
- **Smart GitHub OAuth Redirect**: When the user clicks "Verify with GitHub" in the desktop app, the app passes its own origin as a `state` parameter. The backend reads this and redirects the token back to the correct app (desktop or web), not always to the live website.
- **One-Click Auto-Update Installer**: The `oneClick: true` NSIS configuration means downloading and running a newer `.exe` silently overwrites the old installation.

---

## 🔐 Default Admin Credentials

**Username:** `admin`  
**Password:** `admin123`

> **Note:** On first admin login, a 6-digit OTP is sent to `ADMIN_INITIAL_EMAIL` via Gmail SMTP. Regular users do **not** require email OTP — emails are manually verified by admin within a week.

---

## 🏗️ Project Structure

```
GitTEnz/
├── backend/                       # Spring Boot API
│   ├── src/main/java/com/gitten/
│   │   ├── config/               # Security, CORS, OAuth success handler
│   │   │   └── OAuth2LoginSuccessHandler.java  # Smart redirect to origin app
│   │   ├── controller/           # REST API endpoints
│   │   ├── model/                # MongoDB entities (incl. deletedOnGithub)
│   │   ├── service/              # Business logic incl. deleted repo detection
│   │   └── dto/                  # Data transfer objects
│   ├── .env                      # Local secrets (not in git)
│   └── pom.xml
│
├── frontend/                      # React website
│   ├── src/
│   │   ├── pages/DashboardPage.tsx  # Main dashboard (incl. deleted repos tab)
│   │   ├── components/layout/Sidebar.tsx  # Navigation + download button
│   │   └── components/layout/ServerWakeUp.tsx
│   ├── .env                       # Local dev API URL
│   └── .env.production            # Production API URL
│
├── GitDense/                      # Electron desktop app (separate repo)
│   ├── src/
│   │   ├── lib/auth.tsx           # Persistent session, smart GitHub OAuth
│   │   ├── index.css             # Light blue theme
│   │   └── App.tsx               # Routes: starts at /login, no marketing pages
│   ├── .env                       # Dev API URL (cloud backend)
│   └── .env.production            # Prod API URL (cloud backend)
│
├── README.md
└── DEPLOYMENT.md
```

---

## 🔒 Security

- **OAuth2** — Secure GitHub login with smart per-app redirect
- **JWT** — Stateless authentication (10-year expiry; session managed client-side)
- **Admin OTP** — Two-factor authentication for admin only
- **BCrypt** — Password hashing
- **CORS** — Strict origin allowlist including all known frontend origins
- **Environment Variables** — No secrets in code

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| Backend won't start | Check port 8080, verify all `.env` vars, ensure MongoDB URI is correct |
| Frontend won't start | Check port 5180, run `npm install`, clear `.vite` cache |
| Admin OTP not received | Verify Gmail App Password (16 chars), check spam, ensure 2FA enabled on Gmail |
| GitHub OAuth redirects to wrong app | Backend must be redeployed after `OAuth2LoginSuccessHandler.java` changes |
| "User not found" in desktop app | The account must exist in the **cloud** database. Try logging into `gittenz.vercel.app` first |
| Deleted repos still showing in main list | Click "Sync Data" button in dashboard to force re-sync from GitHub |

---

## 📝 API Reference

### Public
| Endpoint | Method | Description |
|---|---|---|
| `/api/public/health` | GET | Server health check |
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Login (returns OTP required for admin) |
| `/api/auth/verify-otp` | POST | Verify admin OTP, get JWT |
| `/api/auth/forgot-password` | POST | Request password reset link |
| `/api/auth/reset-password` | POST | Submit new password |

### Protected (JWT required)
| Endpoint | Method | Description |
|---|---|---|
| `/api/user/me` | GET | Get current user |
| `/api/user/sync` | POST | Sync repos from GitHub |
| `/api/repositories/{username}` | GET | Get active repositories |
| `/api/repositories/{username}/deleted` | GET | Get deleted repositories |
| `/api/chat` | POST | Chat with AI |

### Admin (Admin JWT required)
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/unverified` | GET | List unverified users |
| `/api/admin/users/{id}/verify-email` | PUT | Verify user email |
| `/api/admin/analytics` | GET | Usage statistics |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Ansuman Mahapatra**

- 🌐 Website: [gittenz.vercel.app](https://gittenz.vercel.app)
- 💼 LinkedIn: [ansumanmahapatra998](https://www.linkedin.com/in/ansumanmahapatra998/)
- 🐙 GitHub: [@Ansuman-Mahapatra](https://github.com/Ansuman-Mahapatra)
- 📧 Email: ansuman197463@gmail.com

---

**Live Demo:** [https://gittenz.vercel.app](https://gittenz.vercel.app)  
**Desktop App:** [https://github.com/Ansuman-Mahapatra/GitDense](https://github.com/Ansuman-Mahapatra/GitDense)  
**Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
