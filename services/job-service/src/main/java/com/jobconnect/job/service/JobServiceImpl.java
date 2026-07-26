package com.jobconnect.job.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.jobconnect.job.dto.ApplicationResponse;
import com.jobconnect.job.dto.CreateJobRequest;
import com.jobconnect.job.dto.JobResponse;
import com.jobconnect.job.dto.UpdateJobRequest;
import com.jobconnect.job.entities.Application;
import com.jobconnect.job.entities.Company;
import com.jobconnect.job.entities.Job;
import com.jobconnect.job.entities.JobStatus;
import com.jobconnect.job.entities.User;
import com.jobconnect.job.repository.CompanyRepository;
import com.jobconnect.job.repository.JobRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    private final CompanyRepository companyRepository;

    @Override
    public JobResponse createJob(CreateJobRequest request, Long userId) {
        Job job = new Job();
        job.setRecruiterId(userId);

        if (request.getCompanyId() != null) {
            job.setCompanyId(request.getCompanyId());
            // Fetch company to fail fast if not found and to get missing name
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            job.setCompanyName(company.getName());
        } else if (request.getCompanyName() != null && !request.getCompanyName().isEmpty()) {
            // Auto-create company if name provided but ID is missing
            Company company = companyRepository.findByName(request.getCompanyName())
                    .orElseGet(() -> {
                        Company newComp = new Company();
                        newComp.setName(request.getCompanyName());
                        newComp.setDescription("Auto-created company");
                        return companyRepository.save(newComp);
                    });
            job.setCompanyId(company.getCompanyId());
            job.setCompanyName(company.getName());
        } else {
            throw new RuntimeException("Company ID or Company Name is required");
        }

        job.setJobTitle(request.getJobTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setEmploymentType(request.getEmploymentType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setLocation(request.getLocation());
        job.setIsRemote(request.getIsRemote() != null ? request.getIsRemote() : false);
        job.setSkillsRequired(request.getSkillsRequired());
        job.setExpiresAt(request.getExpiresAt());
        job.setStatus(JobStatus.ACTIVE);

        Job savedJob = jobRepository.save(job);
        return convertToResponse(savedJob);
    }

    @Override
    public List<JobResponse> getAllJobs(String status, String location, String employmentType, String experienceLevel) {
        List<Job> jobs;

        if (status != null) {
            jobs = jobRepository.findByStatus(status);
        } else if (location != null) {
            jobs = jobRepository.findByLocation(location);
        } else if (employmentType != null) {
            jobs = jobRepository.findByEmploymentType(employmentType);
        } else if (experienceLevel != null) {
            jobs = jobRepository.findByExperienceLevel(experienceLevel);
        } else {
            jobs = jobRepository.findAll();
        }

        return jobs.stream()
                .map(job -> convertToResponse(job))
                .collect(Collectors.toList());
    }

    @Override
    public JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        return convertToResponse(job);
    }

    @Override
    public JobResponse updateJob(Long jobId, UpdateJobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (request.getJobTitle() != null)
            job.setJobTitle(request.getJobTitle());
        if (request.getDescription() != null)
            job.setDescription(request.getDescription());
        if (request.getRequirements() != null)
            job.setRequirements(request.getRequirements());
        if (request.getResponsibilities() != null)
            job.setResponsibilities(request.getResponsibilities());
        if (request.getEmploymentType() != null)
            job.setEmploymentType(request.getEmploymentType());
        if (request.getExperienceLevel() != null)
            job.setExperienceLevel(request.getExperienceLevel());
        if (request.getSalaryMin() != null)
            job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null)
            job.setSalaryMax(request.getSalaryMax());
        if (request.getLocation() != null)
            job.setLocation(request.getLocation());
        if (request.getIsRemote() != null)
            job.setIsRemote(request.getIsRemote());
        if (request.getSkillsRequired() != null)
            job.setSkillsRequired(request.getSkillsRequired());
        if (request.getStatus() != null)
            job.setStatus(request.getStatus());
        if (request.getExpiresAt() != null)
            job.setExpiresAt(request.getExpiresAt());

        Job updatedJob = jobRepository.save(job);
        return convertToResponse(updatedJob);
    }

    @Override
    public void deleteJob(Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new RuntimeException("Job not found with id: " + jobId);
        }
        jobRepository.deleteById(jobId);
    }

    @Override
    public List<JobResponse> getJobsByRecruiter(Long recruiterId) {
        List<Job> jobs = jobRepository.findByRecruiterId(recruiterId);
        return jobs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponse> searchJobs(String keyword) {
        List<Job> jobs = jobRepository.findByJobTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword,
                keyword);
        return jobs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JobResponse closeJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        job.setStatus(JobStatus.CLOSED);
        Job closedJob = jobRepository.save(job);
        return convertToResponse(closedJob);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.jobconnect.job.dto.ApplicationResponse> getJobApplications(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        // Note: Make sure to handle LazyInitializationException if transactional is
        // missing
        // For now assuming transaction is active or open-session-in-view logic applies
        List<com.jobconnect.job.entities.Application> applications = job.getApplications();

        return applications.stream()
                .map(app -> {
                    com.jobconnect.job.dto.ApplicationResponse response = new com.jobconnect.job.dto.ApplicationResponse();
                    response.setApplicationId(app.getApplicationId());
                    response.setJobId(app.getJobId());
                    response.setJobTitle(job.getJobTitle());
                    response.setCandidateId(app.getCandidateId());

                    if (app.getCandidate() != null) {
                        response.setCandidateName(app.getCandidate().getName());
                        response.setCandidateEmail(app.getCandidate().getEmail());
                    }

                    response.setResumeUrl(app.getResumeUrl());
                    response.setCoverLetter(app.getCoverLetter());
                    response.setStatus(app.getStatus().toString());
                    response.setAppliedAt(app.getAppliedAt());
                    return response;
                })
                .collect(Collectors.toList());
    }

    private JobResponse convertToResponse(Job job) {
        JobResponse response = new JobResponse();
        response.setJobId(job.getJobId());
        response.setRecruiterId(job.getRecruiterId());
        response.setCompanyId(job.getCompanyId());
        response.setJobTitle(job.getJobTitle());
        response.setDescription(job.getDescription());
        response.setRequirements(job.getRequirements());
        response.setResponsibilities(job.getResponsibilities());
        response.setEmploymentType(job.getEmploymentType());
        response.setExperienceLevel(job.getExperienceLevel());
        response.setSalaryMin(job.getSalaryMin());
        response.setSalaryMax(job.getSalaryMax());
        response.setLocation(job.getLocation());
        response.setIsRemote(job.getIsRemote());
        response.setSkillsRequired(job.getSkillsRequired());
        response.setStatus(job.getStatus());
        response.setExpiresAt(job.getExpiresAt());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());

        // Get company details
        Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
        if (company != null) {
            response.setCompanyName(company.getName());
            response.setCompanyLogoUrl(company.getLogoUrl());
        }

        return response;
    }
}
