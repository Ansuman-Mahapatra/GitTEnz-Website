# GitTEnz - Advanced GitHub Dashboard

[![Deploy Status](https://img.shields.io/badge/Status-Live-green)](https://gittenz.netlify.app)

GitTEnz is a high-performance, full-stack web application designed with a futuristic **Matrix Green** aesthetic. It provides a living, interactive experience for GitHub developers, featuring a **Tiled Lightning** background, AI-powered assistance, secure admin OTP authentication, and comprehensive repository insights. Available as both a **web app** and an **Electron desktop app**. Built with React (WebGL), Spring Boot, and MongoDB.

## 🚀 Features

### **Core Features**

- **GitHub Integration**: Seamless OAuth2 login to sync repositories and view detailed statistics
- **Email Signup**: Users can create accounts directly with email/password — no OTP required, admin verifies emails within a week
- **Admin Dashboard**: Comprehensive admin panel with user management, analytics, feedback system, and privacy policy management
- **Admin OTP Authentication**: Secure two-factor authentication via Gmail SMTP for admin login only
- **Context-Aware AI Assistant**: Chat with an AI about your code — automatically reads repository README for intelligent, context-aware responses
- **Activity Insights**: Granular breakdown of contribution history (Pushes, Pull Requests) with visual charts and real-time updates
- **Local Starring**: Star repositories within GitTEnz to create personalized lists without affecting GitHub stars
- **Code Editor**: Built-in code viewer and editor with syntax highlighting and file tree navigation
- **Repository Management**: Browse files, view commit history, create branches, and edit code directly in the browser
- **Desktop App**: Full Electron wrapper that bundles the React frontend into a native cross-platform executable

### **Admin Features**

- **User Management**: View all users, manage accounts, reset passwords
- **Email Verification Queue**: View users with unverified emails (`GET /api/admin/users/unverified`) and manually approve them (`PUT /api/admin/users/{id}/verify-email`)
- **Analytics Dashboard**: Visual insights into user growth, repository statistics, and system usage
- **Feedback System**: Collect and manage user feedback with ratings
- **Privacy Policy & Terms**: Manage and update policy documents
- **System Configuration**: Configure application settings

### **UI/UX & Aesthetics**

- **Matrix Green Theme**: A unified, high-contrast emerald and black design system with neon accents
- **Tiled Lightning Surface**: A custom WebGL (GLSL) shader background featuring a grid of dark tiles with dynamic lightning pulses in the gaps
- **Smart Server Wake-Up**: Intelligent loading screen — instantly passes through locally (< 800ms), shows animated wake-up UI only for cold-start Render deployments
- **Premium Glassmorphism**: High-blur content cards and interfaces for a secondary tactile feel
- **Fluid Animations**: Powered by Framer Motion for smooth state transitions and interactions
- **Living Particle System**: Dynamic floating particles that add depth and life to every page
- **Dark Mode Native**: Immersive dark environment by default, optimized for developers
- **Mobile Optimized**: Fully responsive grid system that brings the Matrix experience to any device

## 🛠️ Tech Stack

### **Frontend**

- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful, accessible components
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **Framer Motion** - Smooth UI animations
- **Three.js & GLSL** - High-performance WebGL shaders for the background
- **Lucide React** - Beautiful, consistent iconography

### **Backend**

- **Spring Boot 3** (Java 17+)
- **Spring Security** - OAuth2 + JWT authentication
- **Spring Data MongoDB** - Database integration
- **Spring Mail** - Gmail SMTP for admin OTP emails only
- **RestTemplate** - HTTP client for external API calls
- **Maven** - Dependency management

### **Desktop**

- **Electron** - Cross-platform desktop wrapper
- **Vite Electron Mode** - Production build with `file://` relative paths

### **Database & Services**

- **MongoDB Atlas** - Primary database
- **Redis** - Caching layer (optional)
- **GitHub API** - Repository data source
- **OpenAI API** - AI assistant
- **Gmail SMTP** - Admin OTP email delivery

## ⚙️ Prerequisites

- **Java 17+** (JDK 21 recommended)
- **Node.js** v18 or higher
- **Maven** 3.6+
- **MongoDB Atlas Account**
- **Gmail Account** with App Password (for admin OTP only)
- **GitHub Account** (for OAuth)
- **OpenAI API Key** (for AI features)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ansuman-Mahapatra/GitTEnz-Website.git
cd GitTEnz
```

### 2. Backend Setup

#### Navigate to backend directory:

```bash
cd backend
```

#### Configure Environment Variables:

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Key variables to set in `backend/.env`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OpenAI API Key
OPENAI_API_KEY=sk-your_openai_api_key

# MongoDB Atlas Connection String
SPRING_DATA_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gitten

# Redis (Optional)
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_USERNAME=default
SPRING_DATA_REDIS_PASSWORD=your_redis_password

# Frontend URL
FRONTEND_URL=http://localhost:5180

# Gmail SMTP (used only for admin OTP login)
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_16_char_app_password

# Admin Setup
ADMIN_INITIAL_EMAIL=admin@example.com
JWT_SECRET_KEY=your_64_char_hex_secret
```

#### How to Get Credentials:

**GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:5180`
4. Set Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
5. Copy Client ID and Client Secret

**Gmail App Password** _(admin login only)_:

1. Enable [2-Step Verification](https://myaccount.google.com/security)
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Other (Custom name)"
4. Copy the 16-character password (no spaces)

**OpenAI API Key:**

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy the key (starts with `sk-`)

**MongoDB Atlas:**

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create database user and whitelist IP
4. Get connection string from "Connect" > "Drivers"

### 3. Frontend Setup

#### Navigate to frontend directory:

```bash
cd ../frontend
```

#### Install dependencies & Configure Env:

```bash
npm install
cp .env.example .env
```

## ▶️ Running the Application

### Start Backend (Terminal 1):

```bash
cd backend

# Windows
.\run-backend.ps1

# Linux/Mac
./mvnw spring-boot:run
```

\*Backend runs on **http://localhost:8080\***

### Start Frontend (Terminal 2):

```bash
cd frontend
npm run dev
```

\*Frontend runs on **http://localhost:5180\***

### Start Desktop App (Terminal 3, optional):

```bash
cd desktop
npm start
```

_Ensure the backend and frontend dev server are running first_

## 🔐 Default Admin Credentials

**Username:** `admin`  
**Password:** `admin123`

> **Note:** On first admin login, a 6-digit OTP is sent to the `ADMIN_INITIAL_EMAIL` address via Gmail SMTP. Regular user signups do **not** require email OTP — email verification is done manually by admin within a week.

## 📖 Usage Guide

### For Regular Users (Web Signup):

1. Open `http://localhost:5180`
2. Click "Create Account"
3. Enter your name, username, email, and password
4. Click **"Check"** to verify email availability (no code required)
5. Click **"Sign Up"** — account is created immediately
6. Your email will be manually verified by admin within a week
7. Log in and access your dashboard

### For GitHub OAuth Users:

1. Click "Continue with GitHub"
2. Authorize the application
3. Access your dashboard with all repository stats

### For Admins:

1. Click "Admin Login" on the login page
2. Enter username: `admin`, password: `admin123`
3. Check your email for the 6-digit OTP code
4. Enter the OTP to access the admin dashboard
5. **Verify new user emails:** Go to Users tab → see unverified users → click Verify

## 🏗️ Project Structure

```
GitTEnz/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/gitten/
│   │   ├── config/         # Security, CORS, App configuration
│   │   ├── controller/     # REST API endpoints
│   │   │   ├── AuthController.java   # Signup/login (no user OTP)
│   │   │   ├── AdminController.java  # User verification, analytics
│   │   │   └── UserController.java   # Profile & repo management
│   │   ├── model/          # Database entities (User.emailVerified)
│   │   ├── repository/     # Data access layer
│   │   ├── service/        # Business logic
│   │   └── dto/            # Data transfer objects
│   ├── .env                # Environment variables (not in git)
│   ├── .env.example        # Template for setting up .env
│   └── pom.xml             # Maven dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/ServerWakeUp.tsx   # Smart server health check
│   │   ├── pages/
│   │   │   └── SignupPage.tsx             # Email check (no OTP)
│   │   ├── lib/           # Utilities and auth
│   │   └── hooks/         # Custom React hooks
│   ├── .env.example       # Template for setting up .env
│   ├── package.json       # NPM dependencies
│   └── vite.config.ts     # Vite configuration
│
├── desktop/               # Electron desktop app
│   ├── main.js            # Electron main process
│   ├── package.json       # Desktop dependencies
│   └── README.md          # Desktop-specific instructions
│
├── README.md              # This file
└── DEPLOYMENT.md          # Deployment guide
```

## 🔒 Security Features

- **OAuth2 Authentication** - Secure GitHub login
- **JWT Tokens** - Stateless authentication
- **Admin Email OTP** - Two-factor authentication for admin only
- **Admin-Verified Emails** - New user emails manually verified by admin within a week
- **BCrypt Password Hashing** - Secure password storage
- **CORS Protection** - Configured for specific origins
- **Environment Variables** - Sensitive data not in code

## 🐛 Troubleshooting

### Backend won't start:

- Check if port 8080 is available
- Verify all environment variables in `.env`
- Ensure MongoDB connection string is correct
- Check Java version (17+ required)

### Frontend won't start:

- Check if port 5180 is available
- Run `npm install` to ensure dependencies are installed
- Clear `node_modules` and reinstall if needed

### Admin OTP not received:

- Verify Gmail credentials in `.env`
- Check spam folder
- Ensure 2-Step Verification is enabled on Gmail
- Verify App Password is correct (16 characters, no spaces)
- Note: user signup does NOT use email OTP at all

### Gmail SMTP blocked (on Render free tier):

- Render's free plan blocks outbound SMTP port 587
- Admin OTP emails will fail silently and log `[EMAIL FAILURE]` in server console
- **Fix:** Upgrade Render to Starter ($7/mo), or switch backend to Railway (SMTP allowed on free tier)

### "Connecting" screen shown locally:

- The smart `ServerWakeUp` component waits 800ms before showing the loading overlay
- If you still see it locally, it means the health check endpoint (`/api/public/health`) is slow to respond
- Ensure the backend is fully started before opening the frontend

### GitHub OAuth fails:

- Verify callback URL matches: `http://localhost:8080/login/oauth2/code/github`
- Check GitHub OAuth app settings
- Ensure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct

## 📝 API Documentation

### Public Endpoints:

- `GET /api/public/health` - Server health check
- `POST /api/auth/send-signup-otp` - Check email availability (no OTP sent)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Admin login (returns OTP required)
- `POST /api/auth/verify-otp` - Verify admin OTP and get JWT token
- `POST /api/auth/forgot-password` - Request password reset link
- `POST /api/auth/reset-password` - Submit password reset
- `GET /login/oauth2/code/github` - GitHub OAuth callback

### Protected Endpoints (Require JWT):

- `GET /api/user/me` - Get current user info
- `POST /api/user/sync` - Sync repositories from GitHub
- `PUT /api/user/profile` - Update profile
- `POST /api/chat` - Chat with AI assistant

### Admin Endpoints (Require admin JWT):

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/unverified` - List users with unverified emails
- `PUT /api/admin/users/{id}/verify-email` - Mark user email as verified
- `GET /api/admin/analytics` - Usage statistics
- `GET /api/admin/feedback` - User feedback list

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

**Ansuman Mahapatra**

- GitHub: [@Ansuman-Mahapatra](https://github.com/Ansuman-Mahapatra)
- Email: ansuman197463@gmail.com

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React and Vite teams for modern frontend tools
- Shadcn UI for beautiful components
- OpenAI for the AI capabilities
- GitHub for the API and OAuth

---

**Live Demo:** [https://gittenz.netlify.app](https://gittenz.netlify.app)

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
