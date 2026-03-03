# Deployment Guide for GitTEnz

This comprehensive guide details how to deploy your GitTEnz application to production. We'll deploy the **Frontend to Netlify/Vercel** and the **Backend to Render/Railway**.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with latest code
- [ ] MongoDB Atlas cluster (production-ready)
- [ ] Resend Account with generated API Key
- [ ] GitHub OAuth App credentials
- [ ] OpenAI API key with credits
- [ ] Redis instance (optional, for caching)

---

## 🏗️ PART 1: Frontend Deployment

### Option A: Netlify (Recommended)

#### 1. Prepare for Deployment

Create a `_redirects` file in `frontend/public/`:

```
/*    /index.html   200
```

This ensures client-side routing works correctly.

#### 2. Deploy to Netlify

1. **Login to [Netlify](https://app.netlify.com)**
2. Click **"Add new site"** > **"Import an existing project"**
3. Connect to **GitHub** and select `GitTEnz-Website`
4. **Configure Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. **Environment Variables:**
   - `VITE_API_URL`: Your backend URL (e.g., `https://gittenz-api.onrender.com`)
6. Click **"Deploy site"**

Your frontend will be live at `https://your-site-name.netlify.app`

#### 3. Custom Domain (Optional)

1. Go to **Site settings** > **Domain management**
2. Add your custom domain
3. Configure DNS records as instructed

### Option B: Vercel

#### 1. Add Configuration

Create `vercel.json` in `frontend/`:

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

#### 2. Deploy to Vercel

1. **Login to [Vercel](https://vercel.com)**
2. Click **"Add New..."** > **"Project"**
3. Import from **GitHub** and select `GitTEnz-Website`
4. **Configure Project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL`: Your backend URL
6. Click **"Deploy"**

---

## 🚀 PART 2: Backend Deployment

### Option A: Render (Recommended for Docker)

#### 1. Verify Dockerfile

The `backend/Dockerfile` is already configured for production:

```dockerfile
# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

The `.dockerignore` file optimizes build size by excluding unnecessary files.

#### 2. Deploy on Render

1. **Login to [Render](https://dashboard.render.com/)**
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub repository: `Ansuman-Mahapatra/GitTEnz-Website`
4. **Configure Service:**
   - **Name:** `gittenz-backend`
   - **Region:** Singapore (or closest to your MongoDB)
   - **Branch:** `ansuman` (or your main branch)
   - **Root Directory:** `backend`
   - **Runtime:** **Docker** (Render auto-detects Dockerfile)
   - **Instance Type:** Starter ($7/month) or Free

5. **Environment Variables** (Add all in Render dashboard):

   ```env
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # OpenAI
   OPENAI_API_KEY=sk-your_openai_key

   # MongoDB
   SPRING_DATA_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gitten

   # Redis (Optional)
   SPRING_DATA_REDIS_HOST=your_redis_host
   SPRING_DATA_REDIS_PORT=6379
   SPRING_DATA_REDIS_USERNAME=default
   SPRING_DATA_REDIS_PASSWORD=your_redis_password

   # Frontend URL (Update after frontend deployment)
   FRONTEND_URL=https://your-frontend.netlify.app

   # Resend HTTP API
   RESEND_API_KEY=re_your_api_key_here
   ADMIN_INITIAL_EMAIL=admin@example.com

   # Server Port
   PORT=8080
   ```

6. Click **"Create Web Service"**

**Build Time:** First build takes 8-10 minutes. Subsequent builds are faster due to Docker layer caching.

**Your backend will be live at:** `https://your-service-name.onrender.com`

#### 3. Rebuild Instructions

**Automatic Rebuild (Recommended):**

- Every push to your GitHub branch triggers automatic rebuild
- Render detects changes and rebuilds the Docker container

```bash
git add .
git commit -m "update: your changes"
git push origin ansuman
```

**Manual Rebuild:**

1. Go to Render Dashboard
2. Select your service
3. Click **"Manual Deploy"** > **"Deploy latest commit"**

**Force Fresh Build:**
If you need to rebuild from scratch (clear cache):

1. Go to **Settings** > **Build & Deploy**
2. Click **"Clear build cache & deploy"**

### Option B: Railway

#### 1. Deploy on Railway

1. **Login to [Railway](https://railway.app)**
2. Click **"New Project"** > **"Deploy from GitHub repo"**
3. Select `GitTEnz-Website`
4. **Configure:**
   - **Root Directory:** `backend`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`

5. Add all environment variables (same as Render above)

---

## 🔗 PART 3: Connecting Frontend & Backend

### 1. Update Frontend Environment

After backend deployment:

**For Netlify:**

1. Go to **Site settings** > **Environment variables**
2. Update `VITE_API_URL` to your backend URL
3. **Trigger redeploy** from Deploys tab

**For Vercel:**

1. Go to **Settings** > **Environment Variables**
2. Update `VITE_API_URL`
3. **Redeploy** from Deployments tab

### 2. Update Backend CORS

Ensure `FRONTEND_URL` environment variable in backend matches your frontend URL exactly.

### 3. Update GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update URLs:
   - **Homepage URL:** `https://your-frontend.netlify.app`
   - **Authorization callback URL:** `https://your-backend.onrender.com/login/oauth2/code/github`
4. Save changes

---

## 🗄️ PART 4: Database Configuration

### MongoDB Atlas Production Setup

1. **Create Production Cluster:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster or use existing
   - Choose region close to your backend

2. **Security Configuration:**
   - **Database Access:** Create user with strong password
   - **Network Access:** Add `0.0.0.0/0` (allow from anywhere) or specific IPs
   - **Connection String:** Get from "Connect" > "Drivers"

3. **Update Backend Environment:**
   - Set `SPRING_DATA_MONGODB_URI` with production connection string

### Redis Configuration (Optional)

**For Redis Cloud:**

1. Create account at [Redis Cloud](https://redis.com/try-free/)
2. Create database
3. Get connection details
4. Update backend environment variables

---

## 📧 PART 5: Email Configuration

### Resend API Setup

1. **Create Account:**
   - Go to [Resend](https://resend.com)
   - Sign up for a free account

2. **Generate API Key:**
   - Go to [API Keys](https://resend.com/api-keys)
   - Generate a key with "Sending Access"
   - Copy the key (starts with `re_`)

3. **Update Backend Environment:**

   ```env
   RESEND_API_KEY=re_your_key_here
   ADMIN_INITIAL_EMAIL=admin@example.com
   ```

4. **Test Email Delivery:**
   - Deploy backend
   - Try admin login
   - Verify OTP email is received

---

## ✅ PART 6: Verification & Testing

### 1. Test User Flow

1. **Open Frontend URL**
2. **Click "Continue with GitHub"**
3. **Authorize Application**
4. **Verify Dashboard Loads**
5. **Test Repository Sync**
6. **Test AI Chat Feature**

### 2. Test Admin Flow

1. **Click "Admin Login"**
2. **Enter Credentials:**
   - Username: `admin`
   - Password: `admin123`
3. **Check Email for OTP**
4. **Enter OTP Code**
5. **Verify Admin Dashboard Access**
6. **Test Email Change Feature:**
   - Go to Settings
   - Request email change
   - Verify code sent to new email
   - Complete verification

### 3. Test API Endpoints

```bash
# Health check
curl https://your-backend.onrender.com/actuator/health

# Public endpoint
curl https://your-backend.onrender.com/api/public/health
```

---

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB has strong password and network restrictions
- [ ] GitHub OAuth callback URL is correct
- [ ] CORS is configured for production frontend URL
- [ ] Gmail App Password (not regular password) is used
- [ ] Admin password is changed from default
- [ ] HTTPS is enabled on all services
- [ ] API keys have appropriate rate limits

---

## 🐛 Troubleshooting

### Frontend Issues

**Build Fails:**

- Check Node.js version (18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

**Blank Page After Deploy:**

- Verify `VITE_API_URL` is set correctly
- Check browser console for errors
- Ensure `_redirects` or `vercel.json` is configured

### Backend Issues

**Deployment Fails:**

- Check Dockerfile syntax
- Verify Java version (17+)
- Check Maven build logs
- Ensure all dependencies are in `pom.xml`

**500 Internal Server Error:**

- Check backend logs in Render/Railway
- Verify MongoDB connection string
- Check all environment variables are set
- Verify email credentials

**OTP Not Received:**

- Check Resend API Key in `.env`
- Verify API Key has Sending permissions
- Check spam folder
- Monitor Resend Dashboard for bounce errors

**GitHub OAuth Fails:**

- Verify callback URL matches backend URL
- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Ensure `FRONTEND_URL` is set correctly

### Database Issues

**Connection Timeout:**

- Check MongoDB network access settings
- Verify connection string format
- Ensure database user has correct permissions

---

## 📊 Monitoring & Maintenance

### Application Monitoring

**Render:**

- View logs in real-time from dashboard
- Set up health checks
- Monitor resource usage

**Netlify/Vercel:**

- Check deployment logs
- Monitor function execution
- Track bandwidth usage

### Database Monitoring

**MongoDB Atlas:**

- Monitor cluster metrics
- Set up alerts for high usage
- Review slow queries
- Enable backup

### Email Monitoring

- Track email delivery rates via Resend Dashboard
- Monitor Resend quota (100 emails/day for free accounts)
- Check Resend logs for bounced emails

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Netlify/Vercel and Render support automatic deployments:

1. **Push to GitHub** triggers automatic build
2. **Backend** rebuilds on Render/Railway
3. **Frontend** rebuilds on Netlify/Vercel

### Manual Deployments

**Backend (Render):**

- Go to dashboard
- Click "Manual Deploy" > "Deploy latest commit"

**Frontend (Netlify):**

- Go to Deploys tab
- Click "Trigger deploy"

---

## 📝 Environment Variables Reference

### Backend (.env)

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
SPRING_DATA_MONGODB_URI=
SPRING_DATA_REDIS_HOST=
SPRING_DATA_REDIS_PORT=
SPRING_DATA_REDIS_USERNAME=
SPRING_DATA_REDIS_PASSWORD=
FRONTEND_URL=
RESEND_API_KEY=
ADMIN_INITIAL_EMAIL=
PORT=8080
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🎯 Production Best Practices

1. **Use Production Database:** Separate from development
2. **Enable HTTPS:** Both frontend and backend
3. **Set Up Monitoring:** Track errors and performance
4. **Regular Backups:** MongoDB automated backups
5. **Update Dependencies:** Keep packages up to date
6. **Rate Limiting:** Protect APIs from abuse
7. **Error Tracking:** Use Sentry or similar
8. **CDN:** Use for static assets
9. **Caching:** Implement Redis for better performance
10. **Documentation:** Keep deployment docs updated

---

## 🆘 Support

If you encounter issues:

1. Check application logs
2. Verify all environment variables
3. Test locally first
4. Review error messages carefully
5. Check service status pages (Render, Netlify, MongoDB)

---

## 🎉 Success!

Your GitTEnz application is now live!

**Frontend:** `https://your-app.netlify.app`  
**Backend:** `https://your-api.onrender.com`

Share your deployment and start managing your GitHub repositories with enhanced features!
