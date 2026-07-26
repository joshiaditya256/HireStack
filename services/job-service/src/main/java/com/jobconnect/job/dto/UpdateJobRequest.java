package com.jobconnect.job.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.jobconnect.job.entities.JobStatus;

@Data
public class UpdateJobRequest {
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
}