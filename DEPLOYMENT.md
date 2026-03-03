# Deployment Guide for GitTEnz

This comprehensive guide details how to deploy your GitTEnz application to production. We'll deploy the **Frontend to Netlify/Vercel** and the **Backend to Render/Railway**.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with latest code pushed
- [ ] MongoDB Atlas cluster (production-ready)
- [ ] Gmail account with App Password configured (for admin OTP only)
- [ ] GitHub OAuth App credentials
- [ ] OpenAI API key with credits
- [ ] Redis instance (optional, for caching)

> **Note on Email:** Regular user signups do **not** send emails. Only admin login uses Gmail SMTP for OTP. If using Render free tier, SMTP is blocked — admin OTP emails will fail but the app keeps running. Upgrade to Starter ($7/mo) or use Railway to enable SMTP.

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
   - `VITE_DEVELOPER_LINKEDIN_URL`: Your LinkedIn profile URL
   - `VITE_DEVELOPER_GITHUB_URL`: Your GitHub profile URL
   - `VITE_DEVELOPER_EMAIL`: Your contact email
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
5. **Environment Variables:** Same as Netlify above
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

#### 2. Deploy on Render

1. **Login to [Render](https://dashboard.render.com/)**
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub repository: `Ansuman-Mahapatra/GitTEnz-Website`
4. **Configure Service:**
   - **Name:** `gittenz-backend`
   - **Region:** Singapore (or closest to your MongoDB)
   - **Branch:** `ansuman`
   - **Root Directory:** `backend`
   - **Runtime:** **Docker** (Render auto-detects Dockerfile)
   - **Instance Type:** Starter ($7/month) recommended to allow SMTP, or Free

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

   # Gmail SMTP (admin OTP only — blocked on Render free tier)
   SPRING_MAIL_USERNAME=your_email@gmail.com
   SPRING_MAIL_PASSWORD=your_16_char_app_password
   ADMIN_INITIAL_EMAIL=admin@example.com

   # JWT
   JWT_SECRET_KEY=your_64_char_hex_secret

   # Developer info (shown in footer)
   DEVELOPER_LINKEDIN_URL=https://www.linkedin.com/in/yourprofile/
   DEVELOPER_GITHUB_URL=https://github.com/yourusername
   DEVELOPER_EMAIL=developer@example.com

   # Server Port
   PORT=8080
   ```

6. Click **"Create Web Service"**

**Build Time:** First build takes 8-10 minutes. Subsequent builds are faster due to Docker layer caching.

**Your backend will be live at:** `https://your-service-name.onrender.com`

> ⚠️ **Render Free Tier & SMTP:** The free plan blocks outbound SMTP (port 587). Admin OTP emails will fail silently — the app logs `[EMAIL FAILURE]` to the server console but does not crash. To enable admin OTP emails, upgrade to Render Starter or use Railway instead.

#### 3. Rebuild Instructions

**Automatic Rebuild (Recommended):**
Every push to your GitHub branch triggers an automatic rebuild:

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

1. Go to **Settings** > **Build & Deploy**
2. Click **"Clear build cache & deploy"**

### Option B: Railway (Recommended if you need SMTP on free tier)

Railway does **not** block outbound SMTP, so admin OTP emails work on the free plan.

1. **Login to [Railway](https://railway.app)**
2. Click **"New Project"** > **"Deploy from GitHub repo"**
3. Select `GitTEnz-Website`
4. **Configure:**
   - **Root Directory:** `backend`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
5. Add all environment variables (same as Render above)

---

## 🖥️ PART 3: Desktop App (Electron)

The desktop app wraps the frontend in an Electron shell.

### Development Mode

1. Start the backend (`.\run-backend.ps1`)
2. Start the frontend (`npm run dev` in `frontend/`)
3. Start the desktop app:
   ```bash
   cd desktop
   npm start
   ```

### Building a Production Executable

1. Build the frontend for Electron mode:

   ```bash
   cd frontend
   npx vite build --mode electron
   ```

   This creates `dist/` with `file://`-compatible relative paths.

2. Package the desktop app:
   ```bash
   cd ../desktop
   npm run dist
   ```
   The installer/executable will be output to `desktop/dist/`.

### Desktop Configuration

- The backend URL for the desktop app is set in `frontend/.env.electron`
- Default is `http://localhost:8080` (requires local backend running)

---

## 🔗 PART 4: Connecting Frontend & Backend

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

Ensure `FRONTEND_URL` environment variable in backend matches your deployed frontend URL exactly.

### 3. Update GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update URLs:
   - **Homepage URL:** `https://your-frontend.netlify.app`
   - **Authorization callback URL:** `https://your-backend.onrender.com/login/oauth2/code/github`
4. Save changes

---

## 🗄️ PART 5: Database Configuration

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

### Seed Admin User (First Deploy Only)

After deploying, seed the admin account using a temporary Node.js script:

```js
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const client = new MongoClient("your_mongodb_uri");
await client.connect();
const hash = await bcrypt.hash("admin123", 10);
await client
  .db("gitten")
  .collection("users")
  .updateOne(
    { username: "admin" },
    {
      $set: {
        username: "admin",
        password: hash,
        email: "your@email.com",
        name: "GitTEnz Admin",
        role: "ADMIN",
        onboardingCompleted: true,
        emailVerified: true,
        _class: "com.gitten.model.User",
      },
    },
    { upsert: true },
  );
await client.close();
```

### Redis Configuration (Optional)

1. Create account at [Redis Cloud](https://redis.com/try-free/)
2. Create database
3. Get connection details
4. Update backend environment variables

---

## 📧 PART 6: Email Configuration (Admin OTP Only)

> Email sends are only used for **admin login OTP**. Regular user signups do **not** send any emails — email verification is done manually by the admin in the dashboard.

### Gmail SMTP Setup

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Copy 16-character password

3. **Update Backend Environment:**

   ```env
   SPRING_MAIL_USERNAME=your_email@gmail.com
   SPRING_MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ADMIN_INITIAL_EMAIL=admin@example.com
   ```

4. **Test Email Delivery:**
   - Deploy backend
   - Try admin login
   - Verify OTP email is received

### If Gmail SMTP Fails on Render

The backend logs detailed failure info:

```
[EMAIL FAILURE] Could not send email to: admin@email.com
[EMAIL FAILURE] Root cause: Connection refused: connect
[EMAIL FAILURE] This is likely because the hosting platform blocks outbound SMTP port 587.
```

Fix options ranked by cost:

1. **Switch to Railway** (free, no SMTP block)
2. **Upgrade Render** to Starter ($7/mo)
3. **Use Resend or Brevo HTTP API** (future migration option)

---

## ✅ PART 7: Verification & Testing

### 1. Test User Signup Flow

1. Open frontend URL
2. Click "Create Account"
3. Fill name, username, email, password
4. Click **"Check"** → should show "Email available"
5. Click **"Sign Up"** → account created
6. Log in with new credentials → dashboard loads
7. Admin can then verify the email in admin panel

### 2. Test GitHub OAuth Flow

1. Click "Continue with GitHub"
2. Authorize Application
3. Verify Dashboard Loads
4. Test Repository Sync
5. Test AI Chat Feature

### 3. Test Admin Flow

1. Click "Admin Login"
2. Enter: `admin` / `admin123`
3. Check email for OTP (Gmail required)
4. Enter OTP → admin dashboard loads
5. Go to Users → verify new user emails

### 4. Test API Endpoints

```bash
# Health check
curl https://your-backend.onrender.com/api/public/health

# Check email availability (no OTP sent)
curl -X POST https://your-backend.onrender.com/api/auth/send-signup-otp \
  -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

---

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB has strong password and network restrictions
- [ ] GitHub OAuth callback URL is correct
- [ ] CORS is configured for production frontend URL
- [ ] Gmail App Password (not regular password) is used
- [ ] Admin password is changed from default `admin123`
- [ ] HTTPS is enabled on all services
- [ ] `JWT_SECRET_KEY` is a random 64-character hex string

---

## 🐛 Troubleshooting

### Frontend Issues

**Build Fails:**

- Check Node.js version (18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

**Blank Page After Deploy:**

- Verify `VITE_API_URL` is set correctly
- Check browser console for errors
- Ensure `_redirects` or `vercel.json` is configured

**"Connecting" loading screen always shows:**

- The `ServerWakeUp` component does a fast 800ms ping on load
- If backend health check responds within 800ms, no overlay is shown
- If it takes longer, the overlay shows and retries every 3s
- On Render cold start, this overlay is expected for ~30-60s

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

**Admin OTP Not Received:**

- Check Render plan (free tier blocks SMTP)
- Check Gmail credentials in env vars
- Check spam folder
- View `[EMAIL FAILURE]` logs in Render console for exact reason

**New User Signup Issues:**

- Signup no longer sends email OTP — if users see errors, check backend logs
- Email availability check hits `POST /api/auth/send-signup-otp` (should always return 200 if email is unique)

**GitHub OAuth Fails:**

- Verify callback URL matches backend URL exactly
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
- Look for `[EMAIL FAILURE]` or `[SIGNUP]` prefixes to track email/signup activity
- Set up health checks pointing to `/api/public/health`
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

### Admin Email Verification Workflow

Admins should periodically:

1. Log in to admin panel
2. Check `GET /api/admin/users/unverified` for pending users
3. Call `PUT /api/admin/users/{id}/verify-email` for each user
4. Aim to complete within 1 week of signup

---

## 🔄 Continuous Deployment

Both Netlify/Vercel and Render/Railway support automatic deployments:

1. **Push to GitHub** triggers automatic build
2. **Backend** rebuilds on Render/Railway
3. **Frontend** rebuilds on Netlify/Vercel

```bash
git add .
git commit -m "feat: your change"
git push origin ansuman
```

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
SPRING_MAIL_USERNAME=
SPRING_MAIL_PASSWORD=
ADMIN_INITIAL_EMAIL=
JWT_SECRET_KEY=
DEVELOPER_LINKEDIN_URL=
DEVELOPER_GITHUB_URL=
DEVELOPER_EMAIL=
PORT=8080
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_DEVELOPER_LINKEDIN_URL=
VITE_DEVELOPER_GITHUB_URL=
VITE_DEVELOPER_EMAIL=
```

See `backend/.env.example` and `frontend/.env.example` for annotated templates.

---

## 🎯 Production Best Practices

1. **Use Production Database:** Separate from development
2. **Enable HTTPS:** Both frontend and backend
3. **Set Up Monitoring:** Track errors and performance
4. **Regular Backups:** MongoDB automated backups
5. **Update Dependencies:** Keep packages up to date
6. **Rate Limiting:** Protect APIs from abuse
7. **Change Default Password:** Update admin password from `admin123`
8. **CDN:** Use for static assets
9. **Caching:** Implement Redis for better performance
10. **Admin Email Verification:** Check unverified users weekly

---

## 🆘 Support

If you encounter issues:

1. Check application logs (look for `[EMAIL FAILURE]`, `[SIGNUP]` prefixes)
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
