package com.jobconnect.profile.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileAddDTO {
    private Long userId;
    private String headline;
    private String bio;
    private String skills; // Comma-separated string or JSON array as string
    private String experience; // JSON string
    private String education; // JSON string
    private String location;
    private String avatarUrl;
    private String bannerUrl;
}