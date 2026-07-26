package com.jobconnect.feed.dtos;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePostRequestDTO {
    @NotBlank(message = "Content is required")
    private String content;
    private String imageUrl;
}