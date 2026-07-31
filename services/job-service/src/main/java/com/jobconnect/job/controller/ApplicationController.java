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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobconnect.job.dto.ApplicationResponse;
import com.jobconnect.job.dto.CreateApplicationRequest;
import com.jobconnect.job.dto.UpdateStatusRequest;
import com.jobconnect.job.entities.Role;
import com.jobconnect.job.security.AccessGuard;
import com.jobconnect.job.service.ApplicationService;
import com.jobconnect.job.service.JobService;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForJob(@RequestBody CreateApplicationRequest request) {
        // BUGFIX: candidateId used to come straight from the client-supplied request body --
        // any caller could apply to any job as any candidate simply by putting a different
        // candidateId in the JSON. Only CANDIDATE may apply (api-gateway already blocks any
        // other role for POST /api/applications; this is the defense-in-depth copy), and the
        // candidateId is now always the gateway-validated caller's own id, never client input.
        AccessGuard.requireRole(Role.CANDIDATE);
        request.setCandidateId(AccessGuard.requireUserId());
        ApplicationResponse response = applicationService.applyForJob(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(@PathVariable Long jobId) {
        // Only the recruiter who owns this job (or an admin) may see who applied to it.
        AccessGuard.requireOwnerOrRole(jobService.getJobById(jobId).getRecruiterId(), Role.ADMIN);
        List<ApplicationResponse> applications = applicationService.getApplicationsByJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByCandidate(@PathVariable Long candidateId) {
        // A candidate may list only their own applications; admins may list anyone's.
        AccessGuard.requireOwnerOrRole(candidateId, Role.ADMIN);
        List<ApplicationResponse> applications = applicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable Long applicationId) {
        ApplicationResponse response = applicationService.getApplicationById(applicationId);
        // The applicant themselves, or a recruiter/admin (reviewing it), may view one
        // application's detail.
        if (!response.getCandidateId().equals(AccessGuard.requireUserId())) {
            AccessGuard.requireRole(Role.RECRUITER, Role.ADMIN);
        }
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody UpdateStatusRequest request) {
        // Only the recruiter who owns the underlying job (or an admin) may change an
        // application's status.
        Long jobId = applicationService.getApplicationById(applicationId).getJobId();
        AccessGuard.requireOwnerOrRole(jobService.getJobById(jobId).getRecruiterId(), Role.ADMIN);
        ApplicationResponse response = applicationService.updateApplicationStatus(applicationId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> withdrawApplication(@PathVariable Long applicationId) {
        // Only the candidate who applied (or an admin) may withdraw an application.
        Long candidateId = applicationService.getApplicationById(applicationId).getCandidateId();
        AccessGuard.requireOwnerOrRole(candidateId, Role.ADMIN);
        applicationService.withdrawApplication(applicationId);
        return ResponseEntity.noContent().build();
    }

}