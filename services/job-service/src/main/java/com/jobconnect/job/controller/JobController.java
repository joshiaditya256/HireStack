package com.jobconnect.job.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobconnect.job.dto.CreateJobRequest;
import com.jobconnect.job.dto.JobResponse;
import com.jobconnect.job.dto.UpdateJobRequest;
import com.jobconnect.job.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody CreateJobRequest request) {
        Long currentUserId = userId != null ? userId : 1L; // Fallback for dev/testing
        JobResponse response = jobService.createJob(request, currentUserId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String experienceLevel) {
        List<JobResponse> jobs = jobService.getAllJobs(status, location, employmentType, experienceLevel);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long jobId) {
        JobResponse response = jobService.getJobById(jobId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long jobId,
            @RequestBody UpdateJobRequest request) {
        JobResponse response = jobService.updateJob(jobId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<JobResponse>> getJobsByRecruiter(@PathVariable Long recruiterId) {
        List<JobResponse> jobs = jobService.getJobsByRecruiter(recruiterId);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobResponse>> searchJobs(@RequestParam String keyword) {
        List<JobResponse> jobs = jobService.searchJobs(keyword);
        return ResponseEntity.ok(jobs);
    }

    @PatchMapping("/{jobId}/close")
    public ResponseEntity<JobResponse> closeJob(@PathVariable Long jobId) {
        JobResponse response = jobService.closeJob(jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{jobId}/applications")
    public ResponseEntity<List<com.jobconnect.job.dto.ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId) {
        List<com.jobconnect.job.dto.ApplicationResponse> applications = jobService.getJobApplications(jobId);
        return ResponseEntity.ok(applications);
    }
}