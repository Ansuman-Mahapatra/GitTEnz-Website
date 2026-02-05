package com.gitten.repository;

import com.gitten.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
}
