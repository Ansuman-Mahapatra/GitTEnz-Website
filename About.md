# About GitTEnz

**GitTEnz** is an advanced, intelligent GitHub dashboard wrapper designed to elevate your development workflow. By bridging the gap between standard repository management and modern AI assistance, GitTEnz provides a seamless, aesthetically pleasing, and powerful interface for developers.

---

## 🚀 Mission
To effectively "supercharge" the GitHub experience by providing granular insights, local management capabilities, and contextual AI assistance—all wrapped in a premium, glassmorphic user interface.

---

## 🛠️ Technology Stack

GitTEnz is built on a robust, modern stack ensuring performance, security, and scalability.

### **Frontend Client**
*   **Framework**: [React 18](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/) (Fast HMR & Bundling)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Type Safety)
*   **Styling**:
    *   **Tailwind CSS**: Utility-first styling.
    *   **Shadcn UI**: Accessible, reusable component primitives (based on Radix UI).
    *   **Framer Motion**: Smooth, complex animations and transitions.
*   **State & Data**:
    *   **TanStack Query (React Query)**: Server state management, caching, and auto-refetching (polling).
    *   **React Router DOM**: Client-side routing.
*   **Visualization**:
    *   **Recharts**: Data visualization for commit history and language stats.
    *   **Lucide React**: Consistent, beautiful iconography.
*   **Editor**: Micro-editor components for viewing/editing file code.

### **Backend Server**
*   **Framework**: [Spring Boot 3](https://spring.io/projects/spring-boot) (Java Framework)
*   **Language**: Java 21+
*   **Security**:
    *   **Spring Security 6**: Robust authentication and authorization.
    *   **OAuth2 Client**: Handles GitHub Login flow securely.
    *   **JWT (JSON Web Tokens)**: Stateless session management.
*   **Data Access**:
    *   **Spring Data MongoDB**: ODM for flexible document storage.
    *   **Spring Data Redis**: High-performance caching for GitHub API responses.
*   **APIs**:
    *   **GitHub REST API**: Source of truth for all repository data.
    *   **OpenAI API (GPT-4/3.5)**: Powers the context-aware AI assistant.
*   **Utilities**:
    *   **Lombok**: Reduces boilerplate code.
    *   **Maven**: Dependency management and build automation.

### **Database & Infrastructure**
*   **MongoDB**: Primary store for User Profiles, Chat History, and Local Stars.
*   **Redis**: In-memory data structure store used as a cache/message broker.
*   **Hosting**:
    *   Frontend: Vercel (Edge Network)
    *   Backend: Render / AWS (Containerized)

---

## 🌟 Key Features & Details

### 1. **Next-Gen Dashboard**
*   **Granular Activity Tracking**: Unlike standard GitHub, GitTEnz breaks down your activity into Pushes, PRs, and Issue interactions with precise timestamps.
*   **Live Updates**: The dashboard polls for data every 5 seconds, ensuring your "Recent Activity" feed is always up to the second without page reloads.
*   **Visual Analytics**: Interactive charts display your language usage distribution and commit frequency over weekly/monthly periods.

### 2. **Repository Management**
*   **Hierarchical File Tree**: A custom-built explorer view allowing deep navigation of repository folders.
*   **Structure Viewer**: Generate and copy a Markdown-formatted ASCII tree (`|-- src/...`) of your project structure for documentation.
*   **Local Repository Access**: Uses the **File System Access API** to securely browse local folders on your machine, verifying Git initialization and identifying project types (Node, Java, Python, Rust) automatically.
*   **Commit History**: View detailed commit logs with author info and SHA hashes.

### 3. **Intelligent AI Assistant**
*   **Context-Aware Chat**: The built-in AI doesn't just chat; it reads the `README.md` (and potentially other files) of the repository you are currently viewing.
*   **Problem Solving**: Ask "How do I run this?" or "Explain this function" and get an answer grounded in the actual codebase context.

### 4. **Local Features**
*   **Local Stars**: "Star" repositories within GitTEnz without polluting your public GitHub stars list. Useful for private bookmarking.
*   **Onboarding Flow**: A welcoming setup wizard to personalize your experience.

### 5. **Design & UX**
*   **Glassmorphism**: A modern, translucent UI design utilizing background blurs and subtle gradients.
*   **Dark Mode Native**: Designed primarily for dark mode to reduce eye strain during late-night coding sessions.
*   **Responsive**: Fully functional across Desktop, Tablet, and Mobile devices.

---

## 🔒 Security Architecture
1.  **OAuth2 Handshake**: User authenticates directly with GitHub. GitTEnz backend exchanges the code for an access token.
2.  **Token Encryption**: The GitHub Access Token is encrypted before being stored/used in memory.
3.  **JWT Sessions**: The frontend receives a JWT signed by the backend, ensuring API requests are authenticated without exposing the raw GitHub token to the browser storage.
4.  **CORS & CSRF**: Strict configurations prevent unauthorized cross-origin access.

---

*Generated for GitTEnz Project Documentation*
