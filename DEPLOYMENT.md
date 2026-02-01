# Deployment Guide for GitTEnz

This guide details how to publish your GitTEnz application to the web. We will deploy the **Frontend to Vercel** and the **Backend to Render** (a reliable platform for Java/Spring Boot apps).

---

## 🏗️ PART 1: Frontend Deployment (Vercel)

Vercel is the creators of Next.js but is also excellent for deploying Vite/React applications.

### 1. Preparation
We need to ensure the app handles routing correctly (so refreshing a page like `/dashboard` doesn't give a 404).

1.  A `vercel.json` file has been added to your `frontend/` directory with the following content:
    ```json
    {
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
2.  Commit and push this file to GitHub:
    ```bash
    git add frontend/vercel.json
    git commit -m "chore: add vercel configuration"
    git push
    ```

### 2. Connect to Vercel
1.  Log in to [Vercel](https://vercel.com).
2.  Click **"Add New..."** > **"Project"**.
3.  Import from **GitHub** and select your repository `GitTEnz-Website`.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Framework Preset**: It should auto-detect "Vite".
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `dist` (Default)
5.  **Environment Variables**:
    *   Expand "Environment Variables".
    *   Key: `VITE_API_URL`
    *   Value: *Leave blank for now, or put `https://gittenz.onrender.com` if you already have the backend URL.*
6.  Click **"Deploy"**.

Your frontend will be live (e.g., `https://gittenz.vercel.app`).

---

## 🚀 PART 2: Backend Deployment (Render)

Render is great for hosting Dockerized Java applications.

### 1. Add a Dockerfile
Ensure you have the `Dockerfile` in your `backend/` directory.

```dockerfile
# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Deploy on Render
1.  Log in to [Render](https://dashboard.render.com/).
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository `GitTEnz-Website`.
4.  Settings:
    *   **Root Directory**: `backend`
    *   **Runtime**: Docker
    *   **Region**: Choose one close to you (or your Database).
    *   **Instance Type**: Free (if available) or Starter.
5.  **Environment Variables**:
    You MUST add all your secrets here.
    *   `GITHUB_CLIENT_ID`: (Your GitHub Client ID)
    *   `GITHUB_CLIENT_SECRET`: (Your GitHub Client Secret)
    *   `OPENAI_API_KEY`: (Your OpenAI Key)
    *   `SPRING_DATA_MONGODB_URI`: (Your MongoDB Connection String)
    *   `FRONTEND_URL`: **Update this to your new Vercel URL** (e.g., `https://gittenz.vercel.app`)
    *   `PORT`: `8080`
6.  Click **"Create Web Service"**.

Render will build your app. Once done, it will give you a backend URL (e.g., `https://gittenz.onrender.com`).

---

## 🔗 PART 3: Linking Them Together

Now that both are online, we need to make sure they talk to each other correctly.

### 1. Update Frontend Configuration (Vercel)
1.  Go to your project dashboard on **Vercel**.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add/Edit `VITE_API_URL`.
    *   Value: `https://gittenz.onrender.com` (Your Render Backend URL).
4.  Go to the **Deployments** tab, click on the three dots of the latest deployment, and select **"Redeploy"** for changes to take effect.

### 2. Update GitHub OAuth App
1.  Go to **GitHub Developer Settings** > **OAuth Apps**.
2.  Select your `GitTEnz` app.
3.  Update the URLs to match your new Vercel deployment:
    *   **Homepage URL**: `https://gittenz.vercel.app` (Your Vercel URL)
    *   **Authorization callback URL**: `https://gittenz.onrender.com/login/oauth2/code/github` (This remains the Backend URL, this does NOT change).
4.  Save changes.

---

## ✅ Verification
1.  Open your Vercel URL.
2.  Click **Login**.
3.  You should be redirected to GitHub -> Authorized -> and back to your Vercel App.
