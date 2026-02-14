# How to Get Credentials for GitTEnz

## 1. GitHub OAuth (For Login)
To allow users to log in with GitHub:

1.  Go to **[GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)**.
2.  Click **"New OAuth App"**.
3.  Fill in the details:
    *   **Application Name**: GitTEnz (or any name)
    *   **Homepage URL**: `http://localhost:5180`
    *   **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
4.  Click **"Register application"**.
5.  Copy the **Client ID**.
6.  Click **"Generate a new client secret"** and copy the **Client Secret**.
7.  Paste these into your `backend/.env` file:
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
6.  Paste it into your `backend/.env` file:
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
8.  Paste it into your `backend/.env` file to replace the default `SPRING_DATA_MONGODB_URI`.

## 4. Gmail SMTP (For OTP Emails)
To enable email-based OTP for admin authentication:

1.  **Enable 2-Step Verification** on your Google Account:
    *   Go to **[Google Account Security](https://myaccount.google.com/security)**.
    *   Enable **2-Step Verification** if not already enabled.

2.  **Generate App Password**:
    *   Go to **[App Passwords](https://myaccount.google.com/apppasswords)**.
    *   Select **"Mail"** and **"Other (Custom name)"**.
    *   Name it "GitTEnz" or similar.
    *   Click **"Generate"**.
    *   Copy the 16-character password (no spaces).

3.  **Configure .env**:
    ```env
    SPRING_MAIL_USERNAME=your_email@gmail.com
    SPRING_MAIL_PASSWORD=your_16_char_app_password
    ADMIN_INITIAL_EMAIL=admin_email@example.com
    ```
    *   `SPRING_MAIL_USERNAME`: Your Gmail address (sender)
    *   `SPRING_MAIL_PASSWORD`: The 16-character app password
    *   `ADMIN_INITIAL_EMAIL`: Email where admin will receive OTP

4.  **Security Note**: 
    *   Never commit the `.env` file to Git.
    *   The app password is different from your Gmail password.
    *   For detailed email system documentation, see `EMAIL_SYSTEM_GUIDE.md`.

---

### Important:
The backend is configured to read the **`backend/.env`** file. Ensure you restart the backend after saving changes to this file.
