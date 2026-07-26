package com.jobconnect.feed.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
	private Long postId;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private UserDTO user;
    private Long likesCount;
    private Long commentsCount;
    private Boolean isLiked;
}
