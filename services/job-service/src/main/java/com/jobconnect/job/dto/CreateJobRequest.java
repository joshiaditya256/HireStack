package com.jobconnect.job.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateJobRequest {
    private Long recruiterId;
    private Long companyId;
    private String companyName;
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
    private LocalDateTime expiresAt;
}