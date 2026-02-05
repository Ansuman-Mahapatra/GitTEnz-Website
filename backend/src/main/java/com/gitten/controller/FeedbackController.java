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

    public FeedbackController(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
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
        return ResponseEntity.ok("Feedback submitted successfully");
    }
}
