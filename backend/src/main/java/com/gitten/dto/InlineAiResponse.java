package com.gitten.dto;

public class InlineAiResponse {

    private String response;
    private String sessionId;

    public InlineAiResponse() {
    }

    public InlineAiResponse(String response, String sessionId) {
        this.response = response;
        this.sessionId = sessionId;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
