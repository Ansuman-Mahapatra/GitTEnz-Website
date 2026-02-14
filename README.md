# GitTEnz - Advanced GitHub Dashboard

[![Deploy Status](https://img.shields.io/badge/Status-Live-green)](https://gittenz.netlify.app)

GitTEnz is a modern web application that provides an enhanced interface for GitHub, allowing users to view repositories, statistics, edit code, and interact with an AI assistant. It features a React frontend and a Spring Boot backend with MongoDB.

## 🚀 Features

*   **GitHub Integration**: Log in with GitHub to sync repositories and view stats.
*   **Admin Dashboard**: Comprehensive admin panel with user management, analytics, and system configuration.
*   **Email OTP Authentication**: Secure two-factor authentication for admin login via Gmail.
*   **Email Change Verification**: Admins can change their email with two-step verification process.
*   **Context-Aware AI Assistant**: Chat with an AI about your code. It automatically reads the `README.md` of the current repository to provide relevant answers.
*   **Activity Insights**: Granular breakdown of your contribution history (Pushes, Pull Requests) and visual charts available in the dedicated Activity tab.
*   **Local Starring**: Star repositories within GitTEnz to create your own personalized list. These stars are saved locally in the app and do not affect your actual GitHub stars.
*   **Customizable Dashboard**: View your top repositories and key statistics at a glance with a clean, full-width layout.
*   **Code Editor**: Built-in code viewer and editor with syntax highlighting.
*   **Modern UI**: Built with React, Tailwind CSS, and Shadcn UI.
*   **Secure Auth**: OAuth2 login with JWT authentication for API security.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

*   **Java 17+** (JDK 21 recommended)
*   **Node.js** (v18 or higher)
*   **Maven**
*   **MongoDB Atlas Account**: For the database.
*   **Redis** (Optional): Local instance or Redis Cloud.

## ⚙️ Setup & Configuration

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/GitTEnz.git
cd GitTEnz
```

### 2. Backend Setup (`/backend`)

The backend requires several API keys to function securely.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  **Configuration**:
    The project uses a `.env` file for secrets. You can find the template in `backend/.env`.
    
    Open `backend/.env` and update the following values:

    ```env
    # GitHub OAuth (Settings > Developer Settings > OAuth Apps)
    GITHUB_CLIENT_ID=your_client_id
    GITHUB_CLIENT_SECRET=your_client_secret
    
    # OpenAI API (platform.openai.com)
    OPENAI_API_KEY=sk-your_key_here
    
    # MongoDB Atlas Connection String
    SPRING_DATA_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gitten
    
    # Redis (Optional/Cloud)
    SPRING_DATA_REDIS_HOST=localhost
    SPRING_DATA_REDIS_PORT=6379
    
    # Email Configuration (Gmail SMTP)
    SPRING_MAIL_USERNAME=your_email@gmail.com
    SPRING_MAIL_PASSWORD=your_16_char_app_password
    ADMIN_INITIAL_EMAIL=admin_email@example.com
    ```
    
    > **Note**: For a detailed guide on obtaining these credentials, refer to `GETTING_CREDENTIALS.md` in the project root.
    > **Email Setup**: See `EMAIL_SYSTEM_GUIDE.md` for complete email configuration instructions.

### 3. Frontend Setup (`/frontend`)

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## ▶️ Running the Application

### Start the Backend
Open a terminal in the `backend` folder:
```bash
# Windows
mvn spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```
*The backend will start on **http://localhost:8080**.*

### Start the Frontend
Open a new terminal in the `frontend` folder:
```bash
npm run dev
```
*The frontend will start on **http://localhost:5180**.*

## 🔗 Usage

1.  Open your browser to `http://localhost:5180`.
2.  Click **"Continue with GitHub"**.
3.  You will be redirected to GitHub to authorize the app.
4.  Once logged in, you'll see your dashboard with repository stats.
5.  Use the **AI Chat** in the sidebar to ask questions!

## 🐳 Docker (Optional)

You can also run the backend using Docker:
```bash
cd backend
docker build -t gitten-backend .
docker run -p 8080:8080 --env-file .env gitten-backend
```