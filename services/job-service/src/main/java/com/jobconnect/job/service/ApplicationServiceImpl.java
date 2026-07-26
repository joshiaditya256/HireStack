package com.jobconnect.job.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobconnect.job.dto.ApplicationResponse;
import com.jobconnect.job.dto.CreateApplicationRequest;
import com.jobconnect.job.dto.UpdateStatusRequest;
import com.jobconnect.job.entities.Application;
import com.jobconnect.job.entities.ApplicationStatus;
import com.jobconnect.job.entities.Job;
import com.jobconnect.job.repository.ApplicationRepository;
import com.jobconnect.job.repository.JobRepository;

@Service
@Transactional
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Override
    public ApplicationResponse applyForJob(CreateApplicationRequest request) {

        Optional<Application> existingApplication = applicationRepository
                .findByJobIdAndCandidateId(request.getJobId(), request.getCandidateId());

        if (existingApplication.isPresent()) {
            throw new RuntimeException("You have already applied for this job");
        }

        Application application = new Application();
        application.setJobId(request.getJobId());
        application.setCandidateId(request.getCandidateId());
        application.setResumeUrl(request.getResumeUrl());
        application.setCoverLetter(request.getCoverLetter());
        application.setStatus(ApplicationStatus.PENDING);

        Application savedApplication = applicationRepository.save(application);
        return convertToResponse(savedApplication);
    }

    @Override
    public List<ApplicationResponse> getApplicationsByJob(Long jobId) {
        List<Application> applications = applicationRepository.findByJobId(jobId);
        return applications.stream()
                .map(application -> convertToResponse(application))
                .collect(Collectors.toList());

    }

    @Override
    public List<ApplicationResponse> getApplicationsByCandidate(Long candidateId) {
        List<Application> applications = applicationRepository.findByCandidateId(candidateId);
        return applications.stream()
                .map(application -> convertToResponse(application))
                .collect(Collectors.toList());
    }

    @Override
    public ApplicationResponse getApplicationById(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        return convertToResponse(application);
    }

    @Override
    public ApplicationResponse updateApplicationStatus(Long applicationId, UpdateStatusRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        application.setStatus(request.getStatus());
        Application updatedApplication = applicationRepository.save(application);
        return convertToResponse(updatedApplication);
    }

    @Override
    public void withdrawApplication(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new RuntimeException("Application not found with id: " + applicationId);
        }
        applicationRepository.deleteById(applicationId);
    }

    private ApplicationResponse convertToResponse(Application application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setApplicationId(application.getApplicationId());
        response.setJobId(application.getJobId());
        response.setCandidateId(application.getCandidateId());
        response.setResumeUrl(application.getResumeUrl());
        response.setCoverLetter(application.getCoverLetter());
        response.setStatus(application.getStatus().name());
        response.setAppliedAt(application.getAppliedAt());

        Job job = jobRepository.findById(application.getJobId()).orElse(null);
        if (job != null) {
            response.setJobTitle(job.getJobTitle());
        }

        response.setCandidateName("Candidate Name");
        response.setCandidateEmail("candidate@email.com");

        return response;
    }
}