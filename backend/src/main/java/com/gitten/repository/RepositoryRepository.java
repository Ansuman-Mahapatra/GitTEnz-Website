package com.gitten.repository;

import com.gitten.model.Repository;
import com.gitten.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface RepositoryRepository extends MongoRepository<Repository, String> {
    List<Repository> findByOwner(User owner);
    Optional<Repository> findByGithubId(Long githubId);
}
