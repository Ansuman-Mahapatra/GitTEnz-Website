package com.gitten.repository;

import com.gitten.model.SystemConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface SystemConfigRepository extends MongoRepository<SystemConfig, String> {
    Optional<SystemConfig> findByKey(String key);
}
