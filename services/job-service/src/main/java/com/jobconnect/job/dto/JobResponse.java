package com.jobconnect.job.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.jobconnect.job.entities.ApplicationStatus;
import com.jobconnect.job.entities.JobStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    
    private Long jobId;
    private Long recruiterId;
    private Long companyId;
    private String companyName;        
    private String companyLogoUrl;     
    private String jobTitle;
    private String description;
    private String requirements;
    private String responsibilities;
    private String employmentType;
    private String experienceLevel;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String location;
    private Boolean isRemote;
    private String skillsRequired;
    private JobStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
}