package com.gitten.dto;

public class InlineAiRequest {

    private String selectedText;
    private String userMessage;
    private String commitId;
    private String sessionId;

    public InlineAiRequest() {
    }

    public InlineAiRequest(String selectedText, String userMessage, String commitId, String sessionId) {
        this.selectedText = selectedText;
        this.userMessage = userMessage;
        this.commitId = commitId;
        this.sessionId = sessionId;
    }

    public String getSelectedText() {
        return selectedText;
    }

    public void setSelectedText(String selectedText) {
        this.selectedText = selectedText;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getCommitId() {
        return commitId;
    }

    public void setCommitId(String commitId) {
        this.commitId = commitId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
