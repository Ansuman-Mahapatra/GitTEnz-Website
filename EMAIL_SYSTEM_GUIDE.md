# Email System Configuration

## Overview
The GitTEnz application uses a centralized email system where ALL emails are sent from a single system email address.

## Email Configuration

### System Email (Sender)
- **Email**: `ansuman197463@gmail.com`
- **Purpose**: Sends ALL system emails (OTP, verification, feedback notifications, etc.)
- **Configuration**: Set in `.env` file as `SPRING_MAIL_USERNAME`
- **App Password**: Set in `.env` file as `SPRING_MAIL_PASSWORD`

### Admin Email (Recipient)
- **Default Email**: `23cse522.ansumanmahpatra@giet.edu`
- **Purpose**: Receives admin OTP codes and notifications
- **Configuration**: Initial value from `.env` (`ADMIN_INITIAL_EMAIL`), stored in database
- **Can be changed**: Yes, through the admin panel with email verification

## Email Change Process

### Step 1: Request Email Change
**Endpoint**: `POST /api/admin/email/request-change`

**Request Body**:
```json
{
  "email": "newemail@example.com"
}
```

**What happens**:
1. System validates the new email is not already in use
2. Generates a 6-digit verification code
3. Stores the pending email and verification code in database
4. **Sends verification email FROM `ansuman197463@gmail.com` TO the NEW email address**
5. Verification code expires in 10 minutes

**Response**:
```json
{
  "message": "Verification code sent to newemail@example.com",
  "pendingEmail": "newemail@example.com"
}
```

### Step 2: Verify Email Change
**Endpoint**: `POST /api/admin/email/verify-change`

**Request Body**:
```json
{
  "code": "123456"
}
```

**What happens**:
1. System verifies the code matches and hasn't expired
2. Updates the admin email to the new email
3. Clears the pending email and verification token

**Response**:
```json
{
  "message": "Email updated successfully",
  "email": "newemail@example.com"
}
```

## How It Works

### 1. Admin Login with OTP
- Admin logs in with username `admin` and password `admin123`
- System generates OTP and sends it **FROM** `ansuman197463@gmail.com` **TO** admin's email
- Admin receives OTP at their registered email (default: `23cse522.ansumanmahpatra@giet.edu`)
- Admin enters OTP to complete login

### 2. Admin Changes Email
- Admin requests email change to `newemail@example.com`
- System sends verification code **FROM** `ansuman197463@gmail.com` **TO** `newemail@example.com`
- Admin checks `newemail@example.com` for the verification code
- Admin enters the code to confirm the change
- Future OTPs will be sent to `newemail@example.com`

### 3. Feedback System
- Users submit feedback through the app
- System can send feedback notifications **FROM** `ansuman197463@gmail.com` **TO** admin's email

## Environment Variables

```env
# System Email Configuration
SPRING_MAIL_USERNAME=ansuman197463@gmail.com
SPRING_MAIL_PASSWORD=your_16_character_app_password_here

# Admin Initial Email (only used when creating admin account)
ADMIN_INITIAL_EMAIL=23cse522.ansumanmahpatra@giet.edu
```

## Database Fields

### User Model - Email Related Fields
- `email`: Current active email address
- `pendingEmail`: New email waiting for verification
- `emailVerificationToken`: 6-digit verification code
- `emailVerificationExpiry`: When the verification code expires

### User Model - OTP Related Fields
- `otp`: Current OTP code for login
- `otpExpiry`: When the OTP expires

## Security Features

1. **Email Verification**: New email must be verified before it becomes active
2. **Expiration**: Verification codes expire after 10 minutes
3. **Duplicate Check**: System prevents using an email already registered to another user
4. **Secure Storage**: Verification tokens are stored securely in database
5. **Admin Only**: Only admin users can change their email

## Testing the System

### Test OTP Flow
1. Navigate to http://localhost:5180
2. Login with username: `admin`, password: `admin123`
3. Check email at `23cse522.ansumanmahpatra@giet.edu` for OTP
4. Enter OTP to complete login

### Test Email Change Flow
1. Login as admin
2. Go to admin settings
3. Request email change to a new email
4. Check the NEW email for verification code
5. Enter verification code
6. Email is now updated

## Important Notes

- **ALL emails are sent from `ansuman197463@gmail.com`** - This is the system email
- **Admin email can be different** - It's where the admin receives emails
- **Email verification is required** - Prevents unauthorized email changes
- **Verification codes expire** - Security measure to prevent old codes from being used
- **Database stores the admin email** - System won't overwrite it on restart
