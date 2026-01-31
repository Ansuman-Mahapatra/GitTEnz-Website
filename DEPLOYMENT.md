# Deployment Guide for GitTEnz

This guide details how to publish your GitTEnz application to the web. We will deploy the **Frontend to Netlify** and the **Backend to Render** (a reliable platform for Java/Spring Boot apps).

---

## 🏗️ PART 1: Frontend Deployment (Netlify)

Netlify is excellent for static sites and Single Page Applications (SPAs) like React.

### 1. Preparation
Before deploying, we need to ensure the app handles routing correctly (so refreshing a page doesn't give a 404).

1.  Create a file named `_redirects` inside your `frontend/public/` folder.
2.  Add this single line to it:
    ```
    /*  /index.html  200
    ```
3.  Commit and push this change to GitHub.

### 2. Connect to Netlify
1.  Log in to [Netlify](https://app.netlify.com/).
2.  Click **"Add new site"** > **"Import from an existing project"**.
3.  Select **GitHub** and choose your repository `GitTEnz-Website`.
4.  Configure the build settings:
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `frontend/dist`
5.  **Environment Variables**:
    *   Click "Show advanced" or "Environment variables".
    *   Add key: `VITE_API_URL`
    *   Value: *Leave this blank for now, or put `http://localhost:8080` until we deploy the backend.* (We will update this in Part 3).
6.  Click **"Deploy site"**.

Your frontend will be live (e.g., `https://gittenz-frontend.netlify.app`).

---

## 🚀 PART 2: Backend Deployment (Render)

Render is great for hosting Dockerized Java applications.

### 1. Add a Dockerfile
Create a file named `Dockerfile` (no extension) in your `backend/` directory with the following content. This tells Render how to build your Java app.

```dockerfile
# Build Stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
*Commit and push this file to GitHub.*

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
    You MUST add all your secrets here. Copy the values from your local `.env`.
    *   `GITHUB_CLIENT_ID`: (Your GitHub ID)
    *   `GITHUB_CLIENT_SECRET`: (Your GitHub Secret)
    *   `OPENAI_API_KEY`: (Your OpenAI Key)
    *   `SPRING_DATA_MONGODB_URI`: (Your MongoDB Connection String)
    *   `FRONTEND_URL`: (The Netlify URL from Part 1, e.g., `https://gittenz-frontend.netlify.app`)
    *   `PORT`: `8080`
6.  Click **"Create Web Service"**.

Render will build your app. This might take 5-10 minutes. Once done, it will give you a backend URL (e.g., `https://gittenz-backend.onrender.com`).

---

## 🔗 PART 3: Linking Them Together

Now that both are online, we need to make sure they talk to each other correctly.

### 1. Update Frontend Configuration
1.  Go back to **Netlify** > **Site Settings** > **Environment variables**.
2.  Update `VITE_API_URL`.
    *   Value: Your **Render Backend URL** (e.g., `https://gittenz-backend.onrender.com`).
    *   *Important: Do not add a trailing slash `/`.*
3.  Go to the **Deploys** tab and click **"Trigger deploy"** to rebuild the frontend with the new URL.

### 2. Update GitHub OAuth App
1.  Go to **GitHub Developer Settings** > **OAuth Apps**.
2.  Select your `GitTEnz` app.
3.  Update the URLs to match your production site:
    *   **Homepage URL**: `https://gittenz-frontend.netlify.app` (Your Netlify URL)
    *   **Authorization callback URL**: `https://gittenz-backend.onrender.com/login/oauth2/code/github` (Make sure to replace the domain with your Render Backend URL).
4.  Save changes.

---

## ✅ Verification
1.  Open your Netlify URL.
2.  Click **Login**.
3.  You should be redirected to GitHub -> Authorized -> and back to your Netlify App, with data fetched from your Render Backend!
