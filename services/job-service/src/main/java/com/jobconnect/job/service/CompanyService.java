package com.jobconnect.job.service;

import com.jobconnect.job.dto.CompanyResponse;
import com.jobconnect.job.dto.CreateCompanyRequest;
import com.jobconnect.job.dto.JobResponse;
import com.jobconnect.job.dto.UpdateCompanyRequest;

import java.util.List;

public interface CompanyService {
    
    CompanyResponse createCompany(CreateCompanyRequest request);
    
    List<CompanyResponse> getAllCompanies();
    
    CompanyResponse getCompanyById(Long companyId);
    
    CompanyResponse updateCompany(Long companyId, UpdateCompanyRequest request);
    
    void deleteCompany(Long companyId);
    
    List<JobResponse> getJobsByCompany(Long companyId);
}