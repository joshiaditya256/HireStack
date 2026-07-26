package com.jobconnect.job.dto;


import lombok.Data;

@Data
public class CreateApplicationRequest {
    private Long jobId;
    private Long candidateId;
    private String resumeUrl;
    private String coverLetter;
}