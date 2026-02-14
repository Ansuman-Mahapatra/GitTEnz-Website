# GitTEnz - Advanced GitHub Dashboard

[![Deploy Status](https://img.shields.io/badge/Status-Live-green)](https://gittenz.netlify.app)

GitTEnz is a modern, full-stack web application that provides an enhanced interface for GitHub, featuring an admin dashboard with email OTP authentication, AI-powered code assistance, and comprehensive repository management. Built with React, Spring Boot, and MongoDB.

## 🚀 Features

### **Core Features**
*   **GitHub Integration**: Seamless OAuth2 login to sync repositories and view detailed statistics
*   **Admin Dashboard**: Comprehensive admin panel with user management, analytics, feedback system, and privacy policy management
*   **Email OTP Authentication**: Secure two-factor authentication for admin login via Gmail SMTP
*   **Email Change Verification**: Admins can securely change their email with two-step verification process
*   **Context-Aware AI Assistant**: Chat with an AI about your code - automatically reads repository README for intelligent, context-aware responses
*   **Activity Insights**: Granular breakdown of contribution history (Pushes, Pull Requests) with visual charts and real-time updates
*   **Local Starring**: Star repositories within GitTEnz to create personalized lists without affecting GitHub stars
*   **Code Editor**: Built-in code viewer and editor with syntax highlighting and file tree navigation
*   **Repository Management**: Browse files, view commit history, create branches, and edit code directly in the browser

### **Admin Features**
*   **User Management**: View all users, manage accounts, reset passwords
*   **Analytics Dashboard**: Visual insights into user growth, repository statistics, and system usage
*   **Feedback System**: Collect and manage user feedback with ratings
*   **Privacy Policy**: Manage and update privacy policy and terms of service
*   **System Configuration**: Configure application settings and email preferences

### **UI/UX**
*   **Modern Design**: Built with React, Tailwind CSS, and Shadcn UI components
*   **Dark Mode**: Full dark mode support with theme persistence
*   **Responsive**: Mobile-friendly design that works on all devices
*   **Real-time Updates**: Auto-refresh for activity feeds and repository data

## 🛠️ Tech Stack

### **Frontend**
*   **React 18** with TypeScript
*   **Vite** - Lightning-fast build tool
*   **Tailwind CSS** - Utility-first styling
*   **Shadcn UI** - Beautiful, accessible components
*   **TanStack Query** - Server state management
*   **React Router** - Client-side routing
*   **Framer Motion** - Smooth animations

### **Backend**
*   **Spring Boot 3** (Java 17+)
*   **Spring Security** - OAuth2 + JWT authentication
*   **Spring Data MongoDB** - Database integration
*   **Spring Mail** - Email service (Gmail SMTP)
*   **Maven** - Dependency management

### **Database & Services**
*   **MongoDB Atlas** - Primary database
*   **Redis** - Caching layer (optional)
*   **GitHub API** - Repository data source
*   **OpenAI API** - AI assistant
*   **Gmail SMTP** - Email delivery

## ⚙️ Prerequisites

*   **Java 17+** (JDK 21 recommended)
*   **Node.js** v18 or higher
*   **Maven** 3.6+
*   **MongoDB Atlas Account**
*   **Gmail Account** (for OTP emails)
*   **GitHub Account** (for OAuth)
*   **OpenAI API Key** (for AI features)

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
Create/update the `.env` file in the `backend` directory:

```env
# GitHub OAuth Credentials
# Create OAuth App at: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OpenAI API Key
# Get API Key at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key

# MongoDB Atlas Connection String
# Create cluster at: https://cloud.mongodb.com
SPRING_DATA_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gitten

# Redis Configuration (Optional)
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_USERNAME=default
SPRING_DATA_REDIS_PASSWORD=your_redis_password

# Frontend URL
FRONTEND_URL=http://localhost:5180

# Gmail SMTP Configuration
# Enable 2-Step Verification and generate App Password at: https://myaccount.google.com/apppasswords
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_16_char_app_password
ADMIN_INITIAL_EMAIL=admin_email@example.com
```

#### How to Get Credentials:

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:5180`
4. Set Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
5. Copy Client ID and Client Secret

**Gmail App Password:**
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

#### Install dependencies:
```bash
npm install
```

## ▶️ Running the Application

### Start Backend (Terminal 1):
```bash
cd backend

# Windows
.\run-backend.ps1
# OR
mvn spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```
*Backend runs on **http://localhost:8080***

### Start Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```
*Frontend runs on **http://localhost:5180***

## 🔐 Default Admin Credentials

**Username:** `admin`  
**Password:** `admin123`

> **Note:** On first login, an OTP will be sent to the email configured in `ADMIN_INITIAL_EMAIL`. Check your email for the 6-digit code.

## 📖 Usage Guide

### For Regular Users:
1. Open `http://localhost:5180`
2. Click "Continue with GitHub"
3. Authorize the application
4. Access your dashboard with repository stats
5. Use the AI Chat to ask questions about your code

### For Admins:
1. Click "Admin Login" on the login page
2. Enter username: `admin`, password: `admin123`
3. Check your email for the OTP code
4. Enter the OTP to access the admin dashboard
5. Manage users, view analytics, handle feedback, and configure settings

### Admin Email Change:
1. Login as admin
2. Go to Settings tab
3. Enter new email address
4. Verification code will be sent to the new email
5. Enter code to confirm change

## 🏗️ Project Structure

```
GitTEnz/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/gitten/
│   │   ├── config/         # Security, CORS, App configuration
│   │   ├── controller/     # REST API endpoints
│   │   ├── model/          # Database entities
│   │   ├── repository/     # Data access layer
│   │   ├── service/        # Business logic
│   │   └── dto/            # Data transfer objects
│   ├── .env                # Environment variables (not in git)
│   └── pom.xml             # Maven dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and auth
│   │   └── hooks/         # Custom React hooks
│   ├── package.json       # NPM dependencies
│   └── vite.config.ts     # Vite configuration
│
├── README.md              # This file
└── DEPLOYMENT.md          # Deployment guide
```

## 🔒 Security Features

*   **OAuth2 Authentication** - Secure GitHub login
*   **JWT Tokens** - Stateless authentication
*   **Email OTP** - Two-factor authentication for admins
*   **Email Verification** - Secure email change process
*   **BCrypt Password Hashing** - Secure password storage
*   **CORS Protection** - Configured for specific origins
*   **Environment Variables** - Sensitive data not in code

## 🐛 Troubleshooting

### Backend won't start:
- Check if port 8080 is available
- Verify all environment variables in `.env`
- Ensure MongoDB connection string is correct
- Check Java version (17+ required)

### Frontend won't start:
- Check if port 5180 is available
- Run `npm install` to ensure dependencies are installed
- Clear node_modules and reinstall if needed

### OTP not received:
- Verify Gmail credentials in `.env`
- Check spam folder
- Ensure 2-Step Verification is enabled
- Verify App Password is correct (16 characters, no spaces)

### GitHub OAuth fails:
- Verify callback URL matches: `http://localhost:8080/login/oauth2/code/github`
- Check GitHub OAuth app settings
- Ensure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correct

## 📝 API Documentation

### Public Endpoints:
- `POST /api/auth/login` - Admin login (returns OTP required)
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token
- `GET /login/oauth2/code/github` - GitHub OAuth callback

### Protected Endpoints (Require JWT):
- `GET /api/user/me` - Get current user info
- `GET /api/user/repositories` - Get user repositories
- `POST /api/chat` - Chat with AI assistant
- `GET /api/admin/**` - Admin endpoints (admin role required)

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