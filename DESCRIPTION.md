# GitTEnz - Project Description and Architecture

This document provides a deep dive into the GitTEnz application, detailing its architecture, technology stack, and internal workings. It differs from the README by focusing on *how* it works rather than *how to run* it.

## 1. Project Overview
GitTEnz is a full-stack web application designed to offer an enriched GitHub experience. It acts as a dashboard that not only visualizes your GitHub data but also augments it with AI capabilities.
**Core Philosophy**: A secure, modern, and intelligent layer on top of your existing GitHub workflow.

## 2. System Architecture
The application follows a classic **Client-Server** architecture with a separate database layer.

### **Frontend (Client)**
*   **Role**: Handles user interaction, rendering the UI, and managing client-side state.
*   **Communication**: Communicates with the Backend via RESTful APIs protected by JWT (JSON Web Tokens).
*   **Hosting**: Served via Vite (local dev) or static file serve (prod).

### **Backend (Server)**
*   **Role**: Processes business logic, handles OAuth security, communicates with external APIs (GitHub, OpenAI), and manages the database.
*   **Communication**: Exposes REST endpoints (`/api/**`).
*   **Security**: Acts as the confidential client for GitHub OAuth flowed.

### **Database & External Services**
*   **MongoDB**: Primary data store for user profiles, chat history, and cached repository metadata.
*   **Redis**: High-speed caching layer ensuring fast response times for frequent GitHub API requests.
*   **GitHub API**: Source of truth for repositories and user data.
*   **OpenAI API**: Powering the "Chat with Repo" intelligent assistant.
*   **Gmail SMTP**: Email delivery service for OTP and verification codes.

---

## 3. Technology Stack

### **Frontend (`/frontend`)**
*   **Framework**: [React 18](https://react.dev/) - Component-based UI library.
*   **Build Tool**: [Vite](https://vitejs.dev/) - For lightning-fast development and optimized building.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - For type-safe code and better developer experience.
*   **Styling**:
    *   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
    *   **Shadcn UI**: A collection of reusable components built on Radix UI and Tailwind.
*   **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query) - For handling server state, caching, and data fetching.
*   **Routing**: [React Router](https://reactrouter.com/) - Client-side routing.

### **Backend (`/backend`)**
*   **Framework**: [Spring Boot 3](https://spring.io/projects/spring-boot) - Production-ready Java framework.
*   **Language**: Java 17+
*   **Database**: [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb) - ODM for MongoDB interactions.
*   **Caching**: Spring Data Redis.
*   **Security**: Spring Security (OAuth2 Client + Resource Server) - robust authentication and authorization.

---

## 4. Key Functional Modules

### **Authentication Module**
*   **Flow**: Uses **GitHub OAuth2** for regular users and **Email OTP** for admin.
    1.  User clicks "Login" -> Redirects to GitHub.
    2.  GitHub calls back backend (`/login/oauth2/code/github`) with a code.
    3.  Backend exchanges code for an access token.
    4.  Backend creates/updates user in MongoDB.
    5.  Backend issues a **JWT** to the frontend (stored in LocalStorage/Context).
    6.  Frontend attaches this JWT as `Authorization: Bearer <token>` header for subsequent API calls.
*   **Admin Authentication**: 
    1.  Admin logs in with username/password.
    2.  Backend generates 6-digit OTP and sends via Gmail SMTP.
    3.  Admin enters OTP to complete authentication.
    4.  Backend verifies OTP and issues JWT token.
*   **Email Change Verification**:
    1.  Admin requests email change from settings.
    2.  Backend sends verification code to new email.
    3.  Admin verifies code to confirm email change.
    4.  Email updated in database with security validation.
*   **Key Files**:
    *   `src/lib/auth.tsx` (Frontend): Auth context provider and token management.
    *   `SecurityConfig.java` (Backend): Configures HTTP security chains and OAuth providers.
    *   `EmailService.java` (Backend): Handles OTP and verification email sending.
    *   `AuthController.java` (Backend): Manages admin login and OTP verification.

### **Dashboard & Repository Management**
*   **Function**: Fetches user's repositories, displays stats (stars, forks, languages).
*   **Activity Feed & Stats**: Uses a backend proxy endpoint (`/api/user/activity`) to securely fetch GitHub events. The Dashboard features granular activity tracking (Total Pushes, Pull Requests) with **5-second auto-refresh** and detailed multi-commit breakdowns.
*   **Local Repositories**: Allows users to securely select a local folder to view its contents and metadata directly in the browser using the File System Access API. Includes verification for git initialization.
*   **Local Starring**: Implements a platform-specific "Star" feature that allows users to bookmark repositories locally on GitTEnz without affecting their GitHub stars.
*   **Optimization**: Data is fetched from GitHub acts as the 'source of truth', but heavy computations or historical data might be cached.
*   **Components**:
    *   `DashboardPage.tsx`: Main landing view with specialized `StatsCard`, Charts, and Local Repo management.
    *   `RepositoryController.java`: Handles repositories and the new `/toggle-star` endpoint for local likes.
    *   `SettingsPanel.tsx`: Fully functional settings management (Themes, Profile) with "Coming Soon" placeholders for future modules.
    *   `RepositoryDetailPage.tsx`: Features a hierarchical **File Tree** explorer, commit history, and code editor with polling for real-time updates.

### **AI Assistant (The "Brain")**
*   **Function**: Allows users to chat about their code. "What does this repo do?", "How do I fix this bug?".
*   **Context Awareness**: The AI is now context-aware. When viewing a repository, it automatically fetches the `README.md` content from GitHub to understand the project's purpose and structure.
*   **Implementation**:
    1.  User sends a prompt from `AIAssistant.tsx`.
    2.  Frontend detects the current repository from the URL.
    3.  Backend receives the prompt and repository context in `ChatController.java`.
    4.  `OpenAiService.java` fetches the repository's documentation (README) and constructs a system prompt.
    5.  Sends request to OpenAI GPT models and returns the intelligent response.

---

## 5. Folder Structure Highlights

### **Frontend**
```
frontend/src/
├── components/       # Reusable UI widgets (Buttons, Cards, Modals)
│   └── ui/          # Shadcn components
├── pages/            # Full page views (Dashboard, Login, NotFound)
├── hooks/            # Custom React hooks (e.g., use-toast)
├── lib/              # Utilities (utils.ts) and configurations
└── services/         # API wrappers (if separated from components)
```

### **Backend**
```
backend/src/main/java/com/gitten/
├── config/           # App configuration (Security, AppConfig)
├── controller/       # REST Controllers (Endpoints)
├── model/            # Database Entities (User, Repository)
├── repository/       # Data Access Interfaces (MongoRepository)
├── service/          # Business Logic (GitHubService, OpenAiService)
└── dto/              # Data Transfer Objects (Request/Response shapes)
```

## 6. Development Workflow
1.  **Environment Variables**: Crucial for security. Kept in `.env` (Frontend) and `backend/.env` (Backend), never committed to Git.
2.  **Running Locally**: Frontend runs on port `5180`, Backend on `8080`.
3.  **Proxying**: In production, Nginx or similar would serve the frontend and proxy API requests to the backend. In dev, we use CORS to allow cross-origin requests.
