package com.jobconnect.job.service;


import com.jobconnect.job.dto.ApplicationResponse;
import com.jobconnect.job.dto.CreateApplicationRequest;
import com.jobconnect.job.dto.UpdateStatusRequest;

import java.util.List;

public interface ApplicationService {
    
    ApplicationResponse applyForJob(CreateApplicationRequest request);
    
    List<ApplicationResponse> getApplicationsByJob(Long jobId);
    
    List<ApplicationResponse> getApplicationsByCandidate(Long candidateId);
    
    ApplicationResponse getApplicationById(Long applicationId);
    
    ApplicationResponse updateApplicationStatus(Long applicationId, UpdateStatusRequest request);
    
    void withdrawApplication(Long applicationId);
    
}