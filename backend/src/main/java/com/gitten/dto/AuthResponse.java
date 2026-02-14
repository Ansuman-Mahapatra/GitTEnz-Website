package com.gitten.dto;

public class AuthResponse {
    private String token;
    private com.gitten.model.User user;

    private boolean otpRequired;

    public AuthResponse(String token, com.gitten.model.User user) {
        this(token, user, false);
    }

    public AuthResponse(String token, com.gitten.model.User user, boolean otpRequired) {
        this.token = token;
        this.user = user;
        this.otpRequired = otpRequired;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public com.gitten.model.User getUser() {
        return user;
    }

    public void setUser(com.gitten.model.User user) {
        this.user = user;
    }

    public boolean isOtpRequired() {
        return otpRequired;
    }

    public void setOtpRequired(boolean otpRequired) {
        this.otpRequired = otpRequired;
    }
}
