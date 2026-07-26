package com.jobconnect.job.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {
    private Long companyId;
    private String name;
    private String description;
    private String website;
    private String logoUrl;
    private String industry;
    private String size;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}