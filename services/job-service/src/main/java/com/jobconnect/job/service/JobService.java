package com.jobconnect.job.service;

import com.jobconnect.job.dto.CreateJobRequest;
import com.jobconnect.job.dto.JobResponse;
import com.jobconnect.job.dto.UpdateJobRequest;

import java.util.List;

public interface JobService {

    JobResponse createJob(CreateJobRequest request, Long userId);

    List<JobResponse> getAllJobs(String status, String location, String employmentType, String experienceLevel);

    JobResponse getJobById(Long jobId);

    JobResponse updateJob(Long jobId, UpdateJobRequest request);

    void deleteJob(Long jobId);

    List<JobResponse> getJobsByRecruiter(Long recruiterId);

    List<JobResponse> searchJobs(String keyword);

    JobResponse closeJob(Long jobId);

    List<com.jobconnect.job.dto.ApplicationResponse> getJobApplications(Long jobId);
}