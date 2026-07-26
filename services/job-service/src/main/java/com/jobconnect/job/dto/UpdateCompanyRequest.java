package com.jobconnect.job.dto;

import lombok.Data;

@Data
public class UpdateCompanyRequest {
    private String name;
    private String description;
    private String website;
    private String logoUrl;
    private String industry;
    private String size;
    private String location;
}