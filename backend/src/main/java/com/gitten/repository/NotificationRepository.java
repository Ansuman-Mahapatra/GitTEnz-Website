package com.gitten.repository;

import com.gitten.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserIdAndReadTrue(String userId);

    void deleteByCreatedAtBefore(LocalDateTime expiryDate);
}
