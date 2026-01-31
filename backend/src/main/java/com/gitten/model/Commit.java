package com.gitten.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "commits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commit {
    @Id
    private String id;

    private String sha;
    private String message;
    private String authorName;
    private LocalDateTime date;
    private String htmlUrl;

    @DBRef
    private Repository repository;
}
