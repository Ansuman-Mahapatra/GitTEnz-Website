package com.gitten.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String name;
    private String email;
    private String avatarUrl;
    private String githubId;

    private String accessToken;

    // Last time the user successfully verified via GitHub OAuth
    private java.time.LocalDateTime lastGithubVerifiedAt;

    private boolean onboardingCompleted = false;

    // Whether admin has manually verified this user's email (set to true by admin)
    private boolean emailVerified = false;

    private String password;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public java.time.LocalDateTime getLastGithubVerifiedAt() {
        return lastGithubVerifiedAt;
    }

    public void setLastGithubVerifiedAt(java.time.LocalDateTime lastGithubVerifiedAt) {
        this.lastGithubVerifiedAt = lastGithubVerifiedAt;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    private java.time.LocalDateTime lastActiveAt;

    public java.time.LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(java.time.LocalDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    private String role = "USER";
    private String otp;
    private java.time.LocalDateTime otpExpiry;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public java.time.LocalDateTime getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(java.time.LocalDateTime otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    private String pendingEmail;
    private String emailVerificationToken;
    private java.time.LocalDateTime emailVerificationExpiry;

    public String getPendingEmail() {
        return pendingEmail;
    }

    public void setPendingEmail(String pendingEmail) {
        this.pendingEmail = pendingEmail;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public java.time.LocalDateTime getEmailVerificationExpiry() {
        return emailVerificationExpiry;
    }

    public void setEmailVerificationExpiry(java.time.LocalDateTime emailVerificationExpiry) {
        this.emailVerificationExpiry = emailVerificationExpiry;
    }

    private NotificationPreferences notificationPreferences = new NotificationPreferences();

    public NotificationPreferences getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(NotificationPreferences notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    public static class NotificationPreferences {
        private boolean emailAlerts = true;
        private boolean pushNotifications = true;
        private boolean commitActivityAlerts = true;

        public boolean isEmailAlerts() {
            return emailAlerts;
        }

        public void setEmailAlerts(boolean emailAlerts) {
            this.emailAlerts = emailAlerts;
        }

        public boolean isPushNotifications() {
            return pushNotifications;
        }

        public void setPushNotifications(boolean pushNotifications) {
            this.pushNotifications = pushNotifications;
        }

        public boolean isCommitActivityAlerts() {
            return commitActivityAlerts;
        }

        public void setCommitActivityAlerts(boolean commitActivityAlerts) {
            this.commitActivityAlerts = commitActivityAlerts;
        }
    }
}
