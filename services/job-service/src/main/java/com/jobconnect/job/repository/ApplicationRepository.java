package com.jobconnect.job.repository;

import com.jobconnect.job.entities.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    List<Application> findByJobId(Long jobId);
    
    List<Application> findByCandidateId(Long candidateId);
    
    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);
    
    List<Application> findByStatus(String status);
    
    Long countByJobId(Long jobId);
    
    Long countByJobIdAndStatus(Long jobId, String status);
}
