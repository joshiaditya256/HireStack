package com.jobconnect.feed.service;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.jobconnect.feed.dtos.CreatePostRequestDTO;
import com.jobconnect.feed.dtos.PostDTO;
import com.jobconnect.feed.dtos.CommentDTO;

@Service
public interface FeedService {
	public Page<PostDTO> getFeed(Long CurrentUserId, int page, int size);

	public Page<PostDTO> getUserPosts(Long CurrentUserId, int page, int size);

	public PostDTO createPost(Long CurrentUserId, CreatePostRequestDTO request);

	public void likePost(Long postId, Long userId);

	/** The id of the user who authored this post, or null if the post doesn't exist. */
	public Long getPostOwnerId(Long postId);

	public void deletePost(Long postId);

	public CommentDTO addComment(Long postId, Long userId, String content);

	public java.util.List<CommentDTO> getComments(Long postId);
}
