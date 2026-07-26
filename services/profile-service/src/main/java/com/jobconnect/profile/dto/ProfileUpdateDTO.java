package com.jobconnect.profile.dto;

import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String headline;
    private String bio;
    private String skills;
    private String experience;
    private String education;
    private String location;
    private String avatarUrl;
    private String bannerUrl;
}