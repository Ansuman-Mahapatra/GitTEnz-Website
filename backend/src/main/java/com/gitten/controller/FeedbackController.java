package com.gitten.controller;

import com.gitten.dto.FeedbackRequest;
import com.gitten.model.Feedback;
import com.gitten.model.User;
import com.gitten.repository.FeedbackRepository;
import com.gitten.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final com.gitten.service.NotificationService notificationService;

    public FeedbackController(FeedbackRepository feedbackRepository, UserRepository userRepository,
            com.gitten.service.NotificationService notificationService) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody FeedbackRequest request, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback feedback = new Feedback();
        feedback.setUserId(user.getId());
        feedback.setUsername(user.getUsername());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        feedbackRepository.save(feedback);

        notificationService.createNotification(
                user.getId(),
                "FEEDBACK",
                "Thank you for your valuable feedback! We appreciate your support in making GitTEnz better.",
                null);

        return ResponseEntity.ok("Feedback submitted successfully");
    }
}
