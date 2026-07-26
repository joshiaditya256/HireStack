package com.jobconnect.job.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobconnect.job.dto.CompanyResponse;
import com.jobconnect.job.dto.CreateCompanyRequest;
import com.jobconnect.job.dto.JobResponse;
import com.jobconnect.job.dto.UpdateCompanyRequest;
import com.jobconnect.job.entities.Company;
import com.jobconnect.job.entities.Job;
import com.jobconnect.job.repository.CompanyRepository;
import com.jobconnect.job.repository.JobRepository;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {
    
    private CompanyRepository companyRepository;
    
    private JobRepository jobRepository;
    
    
    @Override
    public CompanyResponse createCompany(CreateCompanyRequest request) {
        Company company = new Company();
        company.setName(request.getName());
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setLogoUrl(request.getLogoUrl());
        company.setIndustry(request.getIndustry());
        company.setSize(request.getSize());
        company.setLocation(request.getLocation());
        
        Company savedCompany = companyRepository.save(company);
        return convertToResponse(savedCompany);
    }
    
    @Override
    public List<CompanyResponse> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();
        return companies.stream()
                .map(company -> convertToResponse(company))
                .collect(Collectors.toList());
    }
    
    @Override
    public CompanyResponse getCompanyById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        return convertToResponse(company);
    }
    
    @Override
    public CompanyResponse updateCompany(Long companyId, UpdateCompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        
        if (request.getName() != null) company.setName(request.getName());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getSize() != null) company.setSize(request.getSize());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        
        Company updatedCompany = companyRepository.save(company);
        return convertToResponse(updatedCompany);
    }
    
    @Override
    public void deleteCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new RuntimeException("Company not found with id: " + companyId);
        }
        companyRepository.deleteById(companyId);
    }
    
    @Override
    public List<JobResponse> getJobsByCompany(Long companyId) {
        List<Job> jobs = jobRepository.findByCompanyId(companyId);
        return jobs.stream()
                .map(job->convertJobToResponse(job))
                .collect(Collectors.toList());
    }
    
    private CompanyResponse convertToResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setCompanyId(company.getCompanyId());
        response.setName(company.getName());
        response.setDescription(company.getDescription());
        response.setWebsite(company.getWebsite());
        response.setLogoUrl(company.getLogoUrl());
        response.setIndustry(company.getIndustry());
        response.setSize(company.getSize());
        response.setLocation(company.getLocation());
        response.setCreatedAt(company.getCreatedAt());
        response.setUpdatedAt(company.getUpdatedAt());
        return response;
    }
    
    private JobResponse convertJobToResponse(Job job) {
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