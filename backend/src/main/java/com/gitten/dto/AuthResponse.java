package com.gitten.dto;

public class AuthResponse {
    private String token;
    private com.gitten.model.User user;

    public AuthResponse(String token, com.gitten.model.User user) {
        this.token = token;
        this.user = user;
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
}
