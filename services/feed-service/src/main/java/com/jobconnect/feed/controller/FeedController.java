package com.jobconnect.feed.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobconnect.feed.dtos.ApiResponse;
import com.jobconnect.feed.dtos.CreatePostRequestDTO;
import com.jobconnect.feed.dtos.PostDTO;
import com.jobconnect.feed.security.AccessGuard;
import com.jobconnect.feed.service.FeedService;
import com.jobconnect.feed.service.ImageUploadService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/feed")
public class FeedController {
	private final FeedService feedService;
	private final ImageUploadService imageUploadService;

	@PostMapping("/upload/image")
	public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
		String url = imageUploadService.uploadImage(file);
		return ResponseEntity.ok(url);
	}

	@GetMapping
	public ResponseEntity<ApiResponse<Page<PostDTO>>> getFeed(
			@RequestParam(defaultValue = "0") int page,
			// BUGFIX: this defaulted to 1 post per page (almost certainly a leftover
			// placeholder/typo), inconsistent with getUserPost's default of 10 below.
			@RequestParam(defaultValue = "10") int size) {

		// BUGFIX: this used to trust a client-suppliable X-User-Id header, falling back to a
		// hardcoded 1L when absent (always true through the gateway) -- every feed view was
		// effectively personalized (e.g. "liked by me" state) as user 1 regardless of who was
		// actually logged in. AccessGuard now reads the gateway-validated identity instead.
		Long currentUserId = AccessGuard.requireUserId();

		Page<PostDTO> feed = feedService.getFeed(currentUserId, page, size);
		return ResponseEntity.ok(ApiResponse.success(feed));
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<ApiResponse<Page<PostDTO>>> getUserPost(
			@PathVariable Long userId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Long userid = userId != null ? userId : 1L;
		Page<PostDTO> posts = feedService.getUserPosts(userid, page, size);
		return ResponseEntity.ok(ApiResponse.success(posts));
	}

	@PostMapping("/user/{userId}")
	@Transactional
	public ResponseEntity<ApiResponse<PostDTO>> createPost(
			@PathVariable Long userId,
			@Valid @RequestBody CreatePostRequestDTO request

	) {
		// BUGFIX: the {userId} path segment is client-supplied and was trusted outright (with a
		// hardcoded fallback to 1L) -- any caller could author a post as any other user just by
		// changing the URL. The post's actual author is now always the gateway-validated caller;
		// the path segment is otherwise unused for authorization.
		Long currentUserId = AccessGuard.requireUserId();
		PostDTO post = feedService.createPost(currentUserId, request);
		return ResponseEntity.ok(ApiResponse.success(post));
	}

	@PostMapping("/post/{postId}/like")
	public ResponseEntity<ApiResponse<Void>> likePost(@PathVariable Long postId) {
		Long currentUserId = AccessGuard.requireUserId();
		feedService.likePost(postId, currentUserId);
		return ResponseEntity.ok(ApiResponse.success(null));
	}

	@PostMapping("/post/{postId}/comment")
	public ResponseEntity<ApiResponse<com.jobconnect.feed.dtos.CommentDTO>> addComment(
			@PathVariable Long postId,
			@Valid @RequestBody com.jobconnect.feed.dtos.CommentRequestDTO request) {
		Long currentUserId = AccessGuard.requireUserId();
		com.jobconnect.feed.dtos.CommentDTO comment = feedService.addComment(postId, currentUserId,
				request.getContent());
		return ResponseEntity.ok(ApiResponse.success(comment));
	}

	@DeleteMapping("/post/{postId}")
	public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long postId) {
		Long ownerId = feedService.getPostOwnerId(postId);
		if (ownerId == null) {
			return ResponseEntity.status(404).body(ApiResponse.error("Post not found"));
		}
		AccessGuard.requireOwnerOrAdmin(ownerId);
		feedService.deletePost(postId);
		return ResponseEntity.ok(ApiResponse.success(null));
	}

	@GetMapping("/post/{postId}/comments")
	public ResponseEntity<ApiResponse<java.util.List<com.jobconnect.feed.dtos.CommentDTO>>> getComments(
			@PathVariable Long postId) {
		return ResponseEntity.ok(ApiResponse.success(feedService.getComments(postId)));
	}

}
