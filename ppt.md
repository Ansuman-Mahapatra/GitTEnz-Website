# 🚀 GitTEnz: Advanced GitHub Dashboard & Analytics
## Project Presentation: Latest Development Phase

---

### 📋 1. Project Overview
**GitTEnz** is an immersive, high-performance ecosystem for GitHub developers.
- **Web App:** Advanced analytics and repository management.
- **GitDense (Desktop):** A dedicated Electron-based native client.
- **Core Goal:** To provide deeper insights than GitHub's native UI while offering a "Matrix-inspired" developer experience.

---

### 🎨 2. Visual Identity & UI/UX
- **Multi-Brand Design:**
  - **Website (Matrix Green):** High-energy, emerald-neon aesthetic with custom WebGL (GLSL) "Tiled Lightning" background.
  - **Desktop (Arctic Blue):** A calm, distinct light blue palette for a native app feel.
- **Micro-interactions:** Powered by Framer Motion for liquid state transitions.
- **Responsive Architecture:** Fully optimized for both 4K monitors and mobile devices.

---

### 🛠️ 3. Technical Architecture (Latest Stack)
- **Frontend:** React 18 / TypeScript / Vite / Tailwind / Shadcn UI.
- **Shaders:** Three.js + Custom Fragment Shaders for background performance.
- **Backend:** Spring Boot 3 / Spring Security / JWT / OAuth2.
- **Database:** MongoDB Atlas (Cloud-native nosql).
- **Communication:** Gmail SMTP for Admin 2FA / OpenAI for AI Assistant.

---

### 🆕 4. Major Recent Developments (Phase 2)
#### 📂 **Deleted Repository Tracking**
- **The Problem:** When a user deletes a repo on GitHub, it traditionally disappears from dashboards, losing historical data.
- **The Solution:** Implemented a detection algorithm that flags missing GitHub IDs and moves them to a dedicated "Deleted Repos" section. 
- **User Value:** Preserves the memory of past projects even after they are removed from GitHub.

#### 🖥️ **GitDense: The Desktop Evolution**
- **Native Wrapper:** Full Electron integration with OS-level optimizations.
- **Silent Updates:** Configured NSIS installer for "one-click" silent overwrites.
- **Direct App-In Landing:** Bypasses marketing homepages to launch straight into the workspace.

---

### ⚡ 5. Tactical Breakthroughs (Logic Engineering)
#### 🔄 **Intelligent OAuth Redirection**
- Custom-built `OAuth2LoginSuccessHandler` on the backend.
- Detects the **initiating client origin** using encoded state parameters.
- If verified from desktop, it displays a "Verification Successful: Close This Tab" UI on the web, while the desktop app automatically resumes.

#### 🔐 **Persistent Desktop Sessions**
- Moved away from aggressive 15-minute inactivity logouts.
- Implemented **30-day+ persistent sessions** for the desktop client.
- Security is maintained via backend token validation (10-year JWT) and silent client-side polling.

---

### 🤖 6. AI & Smart Features
- **Context-Aware AI Assistant:** Reads repository `README.md` and file structures to answer specific development questions.
- **Server Health Check (Wake-Up):** A specialized "Smart Proxy" that pings the backend health endpoint. It only shows a loading screen for cold-starts (Render/Free tier), staying hidden during local work or active sessions.

---

### 📈 7. Project Impact
- **Developer Focus:** Eliminates Distraction-Heavy GitHub feeds.
- **History Preservation:** Never lose trace of a deleted experiment.
- **Accessibility:** Low latency, cross-platform availability (Mac/Win/Linux/Web).

---

### 🚀 8. Future Roadmap
- **Git Hook Integration:** Direct local repository management.
- **Team Collaboration:** Shared AI knowledge bases.
- **Performance Budgeting:** Real-time bundle size analysis in the dashboard.

---

**Author:** Ansuman Mahapatra  
**Live Site:** [gittenz.vercel.app](https://gittenz.vercel.app)  
**Desktop Repo:** [github.com/Ansuman-Mahapatra/GitDense](https://github.com/Ansuman-Mahapatra/GitDense)
