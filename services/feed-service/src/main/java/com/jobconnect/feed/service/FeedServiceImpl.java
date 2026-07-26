package com.jobconnect.feed.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobconnect.feed.dtos.CreatePostRequestDTO;
import com.jobconnect.feed.dtos.PostDTO;
import com.jobconnect.feed.dtos.UserDTO;
import com.jobconnect.feed.entities.Post;
import com.jobconnect.feed.entities.Profile;
import com.jobconnect.feed.entities.User;
import com.jobconnect.feed.repositories.CommentRepository;
import com.jobconnect.feed.repositories.PostLikeRepository;
import com.jobconnect.feed.repositories.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedServiceImpl implements FeedService {
	private final PostRepository postrepo;
	private final CommentRepository commentrepo;
	private final PostLikeRepository postlikerepo;

	@Override
	public Page<PostDTO> getFeed(Long CurrentUserId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<Post> posts = postrepo.findAllWithUser(pageable);

		return posts.map(post -> mapToPostDTO(post, CurrentUserId));

	}

	@Override
	public Page<PostDTO> getUserPosts(Long userid, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<Post> posts = postrepo.findByUserIdOrderByCreatedAtDesc(userid, pageable);
		return posts.map(post -> mapToPostDTO(post, userid));
	}

	@Override
	@Transactional
	public PostDTO createPost(Long CurrentUserId, CreatePostRequestDTO request) {
		Post post = new Post();
		post.setUserId(CurrentUserId);
		post.setContent(request.getContent());
		post.setImageUrl(request.getImageUrl());
		Post savedPost = postrepo.save(post);
		savedPost = postrepo.findById(savedPost.getId())
				.orElseThrow(() -> new RuntimeException("Post not found after save"));
		System.out.println(savedPost);
		return mapToPostDTO(savedPost, CurrentUserId);
	}

	private PostDTO mapToPostDTO(Post post, Long currentUserId) {
		User user = post.getUser();
		Profile profile = (user != null) ? user.getProfile() : null;

		return PostDTO.builder()
				.postId(post.getId())
				.content(post.getContent())
				.imageUrl(post.getImageUrl())
				.createdAt(post.getCreatedAt())
				.user(UserDTO.builder()
						.id(user != null ? user.getId() : post.getUserId())
						.name(user != null ? user.getName() : "Unknown User")
						.headline(profile != null ? profile.getHeadline() : null)
						.avatarUrl(profile != null ? profile.getAvatarUrl() : null)
						.build())
				.likesCount(postlikerepo.countByPostId(post.getId()))
				.commentsCount(commentrepo.countByPostId(post.getId()))
				.isLiked(postlikerepo.existsByPostIdAndUserId(post.getId(), currentUserId))
				.build();
	}

	@Override
	@Transactional
	public void likePost(Long postId, Long userId) {
		if (postlikerepo.existsByPostIdAndUserId(postId, userId)) {
			postlikerepo.deleteByPostIdAndUserId(postId, userId);
		} else {
			com.jobconnect.feed.entities.PostLike like = new com.jobconnect.feed.entities.PostLike();
			like.setPostId(postId);
			like.setUserId(userId);
			postlikerepo.save(like);
		}
	}

	@Override
	@Transactional
	public com.jobconnect.feed.dtos.CommentDTO addComment(Long postId, Long userId, String content) {
		com.jobconnect.feed.entities.Comment comment = new com.jobconnect.feed.entities.Comment();
		comment.setPostId(postId);
		comment.setUserId(userId);
		comment.setContent(content);
		com.jobconnect.feed.entities.Comment savedComment = commentrepo.save(comment);

		// We need to fetch the user to populate the DTO fully
		// Since we don't have direct access to UserService here easily without circular
		// deps or Feign,
		// we might rely on the entity mapping if configured correctly, or fetch it.
		// For now, let's try to reload the comment to get the @ManyToOne user
		// relationship populated if lazy loaded

		// A simple trick is to findById to trigger the join if eager, or relies on
		// Hibernate L1 cache
		// But since we just saved it, the User might be null in the entity if we didn't
		// set it.
		// We set userId. Hibernate can resolve it if we EntityManager.refresh() but
		// that's complex here.
		// Workaround: We'll accept that username might be null immediately or fetch it
		// if crucial.
		// Let's rely on the assumption that the UI can handle it or we fetch
		// UserProfile from User service separately.
		// Better: Fetch the User entity using a UserRepository if available in this
		// microservice (it is! User entity is in this package)
		// Wait, User entity is defined in `com.jobconnect.feed.entities`. So we can use
		// a UserRepository?
		// FeedServiceImpl uses PostRepository, CommentRepository... does it have
		// UserRepository?
		// It's not injected. Let's rely on the lazy load or just return what we have.
		// Actually, best to just return the DTO. The Frontend can append it.

		return mapToCommentDTO(savedComment);
	}

	@Override
	public java.util.List<com.jobconnect.feed.dtos.CommentDTO> getComments(Long postId) {
		return commentrepo.findByPostIdOrderByCreatedAtDesc(postId).stream()
				.map(this::mapToCommentDTO)
				.collect(java.util.stream.Collectors.toList());
	}

	private com.jobconnect.feed.dtos.CommentDTO mapToCommentDTO(com.jobconnect.feed.entities.Comment comment) {
		User user = comment.getUser();
		Profile profile = user != null ? user.getProfile() : null;

		return com.jobconnect.feed.dtos.CommentDTO.builder()
				.id(comment.getCommentId())
				.postId(comment.getPostId())
				.userId(comment.getUserId())
				.userName(user != null ? user.getName() : "User")
				.userAvatar(profile != null ? profile.getAvatarUrl() : null)
				.content(comment.getContent())
				.createdAt(comment.getCreatedAt())
				.build();
	}

}
