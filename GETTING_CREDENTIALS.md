# How to Get Credentials for GitTEnz

## 1. GitHub OAuth (For Login)
To allow users to log in with GitHub:

1.  Go to **[GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)**.
2.  Click **"New OAuth App"**.
3.  Fill in the details:
    *   **Application Name**: GitTEnz (or any name)
    *   **Homepage URL**: `http://localhost:5173`
    *   **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
4.  Click **"Register application"**.
5.  Copy the **Client ID**.
6.  Click **"Generate a new client secret"** and copy the **Client Secret**.
7.  Paste these into your `.env` file:
    ```env
    GITHUB_CLIENT_ID=your_id_here
    GITHUB_CLIENT_SECRET=your_secret_here
    ```

## 2. OpenAI API Key (For AI Assistant)
To enable the AI chat features:

1.  Go to **[OpenAI Platform > API Keys](https://platform.openai.com/api-keys)**.
2.  Log in or Sign up.
3.  Click **"Create new secret key"**.
4.  Name it (e.g., "GitTEnz").
5.  Copy the key (starts with `sk-...`).
6.  Paste it into your `.env` file:
    ```env
    OPENAI_API_KEY=sk-...
    ```
    *Note: You need credits/billing enabled on your OpenAI account.*

## 3. MongoDB Atlas (Database)
You are currently using a hardcoded connection string. To use your own:

1.  Go to **[MongoDB Atlas](https://cloud.mongodb.com)**.
2.  Create a Cluster (Free Tier is fine).
3.  Go to **Database Access** and create a user (e.g., `db_user` / `password`).
4.  Go to **Network Access** and whitelist your IP (or allow `0.0.0.0/0` for everywhere).
5.  Go to **Database > Connect > Drivers**.
6.  Copy the connection string.
7.  Replace `<password>` with your database user's password.
8.  Paste it into your `.env` file if you uncomment the `SPRING_DATA_MONGODB_URI` line.

---

### Important:
The backend is configured to read the **`d:/GitTEnz/backend/.env`** file. Ensure you restart the backend after saving changes to this file.
