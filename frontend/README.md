# GitTEnz Frontend

This is the frontend application for GitTEnz, built with React, Vite, and Shadcn UI.

## Project Info

**URL**: [Add your deployment URL here]

## Getting Started

To run the project locally:

1. Prerequisities:
   - Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
   - Java 21+ and Maven

2. Clone the repo and install dependencies:

```sh
npm install
```

3. Start the development server:

```sh
npm run dev
```

4. Start the backend:

```sh
cd backend
mvn spring-boot:run
```

## Features
- **OAuth2 Login**: Secure authentication with GitHub.
- **Dashboard**: View repository stats (Stars, Forks, Languages) and Recent Activity.
- **Activity Feed**: Real-time updates of your GitHub actions with multi-commit details.
- **Repository Management**:
  - View code, branches, and commits.
  - **File Tree**: Explore your project structure hierarchically.
  - **Code Editor**: View and edit files with syntax highlighting.
  - **Local Repos**: Select and view local folders securely.
- **AI Assistant**: Chat with your codebase contextually.
- **Dark Mode**: Sleek, modern interface with glassmorphism effects.

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Spring Boot (Backend)
- MongoDB (Database)

## How can I deploy this project?

Please refer to the detailed `DEPLOYMENT.md` file in the root directory for instructions on deploying both the frontend and backend.

