package com.gitten.controller;

import com.gitten.model.Notification;
import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import com.gitten.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // As requested: "if users mark it as read then it will be automatically deleted
        // after refresh"
        notificationService.cleanupReadNotifications(user.getId());

        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getId()));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
