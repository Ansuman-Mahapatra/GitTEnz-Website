# GitTEnz Backend Documentation

## Overview
The backend of GitTEnz is a robust, microservice-ready application built with **Spring Boot 3**. It serves as the central hub for authentication, data persistence, GitHub API proxying, and local Git repository operations using JGit. It integrates with **MongoDB** for storage and **Redis** for caching high-frequency data.

## Base URL
- **Local**: `http://localhost:8080` (Default)
- **Frontend URL**: Configured via `frontend.url` (Default: `http://localhost:5173`)

## Authentication
The application supports two primary authentication methods:

1.  **OAuth2 (GitHub)**:
    - User redirects to `/oauth2/authorization/github`.
    - Upon success, the backend redirects to the frontend with a JWT.
    - Used for GitHub API integration.

2.  **Email/Password (Manual)**:
    - Standard registration and login flows.
    - Passwords are encrypted using **BCrypt**.
    - Returns the same JWT format as OAuth2 login.

**Authorization Header:**
All protected endpoints require a Bearer Token:
`Authorization: Bearer <your_jwt_token>`

## API Endpoints

### 1. Authentication (`/api/auth`)

#### **Signup (Manual)**
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "65b2f...",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://ui-avatars.com/api/?name=John+Doe",
      "onboardingCompleted": false
    }
  }
  ```

#### **Login (Manual)**
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates via username OR email.
- **Request Body**:
  ```json
  {
    "identifier": "john@example.com", // or "johndoe"
    "password": "securePassword123"
  }
  ```
- **Response**: Same as Signup.

---

### 2. User Management (`/api/user`)

#### **Get Current User**
- **Endpoint**: `GET /api/user/me`
- **Description**: Returns profile details of the authenticated user.
- **Response**:
  ```json
  {
    "id": "65b2f...",
    "username": "ansuman",
    "name": "Ansuman Mahapatra",
    "email": "ansuman@example.com",
    "avatarUrl": "https://avatars.githubusercontent.com/u/...",
    "githubId": "12345",
    "onboardingCompleted": true
  }
  ```

#### **User Activity**
- **Endpoint**: `GET /api/user/activity`
- **Description**: Fetches recent GitHub event activity (cached).
- **Response**:
  ```json
  [
    {
      "id": "35361361836",
      "type": "PushEvent",
      "repo": { "name": "Ansuman-Mahapatra/GitTEnz" },
      "created_at": "2024-02-01T10:00:00Z",
      "payload": { "size": 3, "commits": [...] }
    }
  ]
  ```

#### **Starred Repositories (Local)**
- **Endpoint**: `GET /api/user/starred`
- **Description**: Returns a list of repositories the user has "starred" locally within the app.
- **Response**: List of Repository objects (see below).

---

### 3. Repositories (`/api/repos`)

#### **List Repositories**
- **Endpoint**: `GET /api/repos`
- **Description**: Lists both remote GitHub repos and locally scanned repos associated with the user.
- **Response**:
  ```json
  [
    {
      "id": "12345",
      "name": "GitTEnz",
      "fullName": "Ansuman-Mahapatra/GitTEnz",
      "description": "A modern Git client",
      "language": "Java",
      "stars": 15,
      "local": false,
      "owner": { "username": "ansuman" }
    }
  ]
  ```

#### **Scan Local Repositories**
- **Endpoint**: `GET /api/repos/local?path=/path/to/scan`
- **Description**: Scans a directory on the server/host for `.git` folders.
- **Response**: List of repository objects found.

#### **Save Local Repository**
- **Endpoint**: `POST /api/repos/local-save`
- **Description**: Persists metadata about a local repository access.
- **Request Body**: Repository JSON object.

#### **Get Branches**
- **Endpoint**: `GET /api/repos/{owner}/{repo}/branches`
- **Description**: Fetches branches. Works for both GitHub (via API) and Local (via JGit).

#### **Get File Tree**
- **Endpoint**: `GET /api/repos/{owner}/{repo}/tree/{sha}`
- **Description**: Recursive file tree for a specific commit/branch SHA.

#### **Get File Content**
- **Endpoint**: `GET /api/repos/{owner}/{repo}/contents/{path}`
- **Description**: Returns raw content of a file.

#### **Update File**
- **Endpoint**: `PUT /api/repos/{owner}/{repo}/contents/{path}`
- **Request Body**:
  ```json
  {
    "content": "Updated file content...",
    "message": "Commit message",
    "sha": "blob_sha" // Required for GitHub API consistency
  }
  ```

#### **Create Branch**
- **Endpoint**: `POST /api/repos/{owner}/{repo}/branches`
- **Request Body**:
  ```json
  {
    "branchName": "feature/new-branch",
    "sha": "base_commit_sha"
  }
  ```

---

### 4. AI Chat (`/api/chat`)

#### **Send Message**
- **Endpoint**: `POST /api/chat`
- **Description**: Sends a prompt to the AI assistant. The service maintains context where possible.
- **Requirements**: Requires a valid OpenAI API Key configured in the backend.
- **Request Body**:
  ```json
  {
    "message": "Explain this file",
    "repoName": "GitTEnz", // Optional context
    "filePath": "src/main/java/App.java" // Optional context
  }
  ```
- **Response**:
  ```json
  {
    "response": "This file contains the main entry point for the Spring Boot application..."
  }
  ```
- **Note**: Currently implemented as a REST endpoint (Request/Response), not WebSocket.

---

## WebSockets
*Currently, no WebSocket endpoints are implemented. All real-time features (like charts/activity) rely on efficient polling or optimized queries.*

## Data Models

### User (MongoDB: `users`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | MongoDB ID |
| `username` | String | Unique username |
| `email` | String | User email |
| `password` | String | BCrypt encrypted (if manual) |
| `githubId` | String | GitHub ID (if OAuth) |
| `accessToken` | String | GitHub OAuth Token |
| `onboardingCompleted`| Boolean | Track user setup state |

### Repository (MongoDB: `repositories`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | MongoDB ID |
| `githubId` | Long | Remote ID (if applicable) |
| `localPath` | String | Absolute path (if local) |
| `isLocal` | Boolean | True if strictly local |
| `likedUserIds` | Set | List of users who starred this locally |

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
