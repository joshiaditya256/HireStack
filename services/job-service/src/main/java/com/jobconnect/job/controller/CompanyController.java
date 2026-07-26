package com.jobconnect.job.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobconnect.job.dto.CompanyResponse;
import com.jobconnect.job.dto.CreateCompanyRequest;
import com.jobconnect.job.dto.JobResponse;
import com.jobconnect.job.dto.UpdateCompanyRequest;
import com.jobconnect.job.service.CompanyService;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private CompanyService companyService;

    @PostMapping("/createCompany")
    public ResponseEntity<CompanyResponse> createCompany(@RequestBody CreateCompanyRequest request) {
        CompanyResponse response = companyService.createCompany(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        List<CompanyResponse> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> getCompanyById(
            @PathVariable Long companyId) {
        CompanyResponse response = companyService.getCompanyById(companyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> updateCompany(
            @PathVariable Long companyId,
            @RequestBody UpdateCompanyRequest request) {
        CompanyResponse response = companyService.updateCompany(companyId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteCompany(
            @PathVariable Long companyId) {
        companyService.deleteCompany(companyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{companyId}/jobs")
    public ResponseEntity<List<JobResponse>> getJobsByCompany(
            @PathVariable Long companyId) {
        List<JobResponse> jobs = companyService.getJobsByCompany(companyId);
        return ResponseEntity.ok(jobs);
    }
}