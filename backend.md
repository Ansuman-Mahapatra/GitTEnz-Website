# GitTEnz Backend Documentation

## Overview
The backend of GitTEnz is a robust, microservice-ready application built with **Spring Boot 3**. It serves as the central hub for authentication, data persistence, GitHub API proxying, and local Git repository operations using JGit. It integrates with **MongoDB** for storage and **Redis** for caching high-frequency data.

## Technology Stack
- **Framework**: Spring Boot 3.2+ (Java 21)
- **Database**: MongoDB (User data, Repository metadata)
- **Caching**: Redis (Repositories, GitHub events)
- **Security**: Spring Security 6, JWT (JSON Web Tokens), OAuth2 Client (GitHub)
- **Git Operations**: Eclipse JGit (for local repository management)
- **AI Integration**: OpenAI API (via customized AI Service)
- **Build Tool**: Maven

## Architecture & Key Components

### 1. Security & Authentication (`com.gitten.config`)
The application implements a dual-authentication mechanism:
- **OAuth2**: Users can sign in via GitHub. Success is handled by `OAuth2LoginSuccessHandler`, which generates a JWT for the frontend.
- **Manual Auth**: Users can sign up via username/password (BCrypt encoded).
- **JWT Filter**: `JwtAuthenticationFilter` intercepts requests to validate Bearer tokens before reaching protected endpoints.

### 2. Controllers (API Endpoints)
The API is designed with REST principles.

#### Auth Controller (`/api/auth`)
- `POST /signup`: Registers a new user with manual credentials.
- `POST /login`: Authenticates a user and returns a JWT.

#### Repository Controller (`/api/repos`)
- `GET /`: Lists user's repositories (cached).
- `GET /local`: Scans a specific endpoint on the server/local machine for repositories.
- `GET /{owner}/{repo}/branches`: Fetches branches (Remote or Local).
- `GET /{owner}/{repo}/tree/{sha}`: Retrieves file structure.
- `GET /{owner}/{repo}/contents/**`: Reads file content.
- `PUT /{owner}/{repo}/contents/**`: Updates file content and commits changes.
- `POST /{owner}/{repo}/branch`: Creates a new branch.

#### User Controller (`/api/user`)
- `GET /me`: Returns current user details.
- `GET /activity`: Fetches user's commit activity (cached).
- `GET /starred`: Fetches locally starred repositories.

#### Chat Controller (`/api/chat`)
- `POST /`: Sends a query to the AI assistant regarding the codebase or general programming questions.

### 3. Services (`com.gitten.service`)
- **`GitHubService`**: Wraps the GitHub REST API/Octokit to fetch remote data.
- **`LocalGitService`**: Uses **JGit** to perform operations on the host machine's file system (commits, trees, branches) without needing a remote server.
- **`AiService`**: Connects to OpenAI to provide code explanations and debugging help.

### 4. Data Models (`com.gitten.model`)
- **`User`**: Stores profile info, GitHub access token, and onboarding status.
- **`Repository`**: Metadat for both remote and local repositories, including local "stars".

## Configuration
The application is configured via `application.yml` in `src/main/resources`.
- **Server Port**: 8080
- **MongoDB URI**: Connection string for data persistence.
- **Redis**: Host and port for caching.
- **GitHub Client**: Client ID and Secret for OAuth2 app.

## Running the Application
```bash
# Using Maven Wrapper
./mvnw spring-boot:run
```
Ensure MongoDB and Redis are running locally or accessible via configuration URIs.
