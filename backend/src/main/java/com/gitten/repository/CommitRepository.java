package com.gitten.repository;

import com.gitten.model.Commit;
import com.gitten.model.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommitRepository extends MongoRepository<Commit, String> {
    List<Commit> findByRepository(Repository repository);
}
