package com.gitten.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "system_config")
public class SystemConfig {
    @Id
    private String id;
    private String key; // e.g., "privacy_policy"
    private String value; // The content

    public SystemConfig() {
    }

    public SystemConfig(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
