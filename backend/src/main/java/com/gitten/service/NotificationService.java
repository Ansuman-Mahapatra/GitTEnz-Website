package com.gitten.service;

import com.gitten.model.Notification;
import com.gitten.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<Notification> getNotificationsForUser(String userId) {
        // Cleanup old notifications first (15 days)
        notificationRepository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(15));

        // Fetch
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // After fetching, we should prepare for deletion of read ones on NEXT refresh
        // But the user requested "if users mark it as read then it will be
        // automatically deleted after refresh"
        // So the controller will handle the deleteByUserIdAndReadTrue before returning
        // the list

        return notifications;
    }

    public void createNotification(String userId, String type, String message, String link) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setLink(link);
        notificationRepository.save(notification);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void cleanupReadNotifications(String userId) {
        notificationRepository.deleteByUserIdAndReadTrue(userId);
    }
}
