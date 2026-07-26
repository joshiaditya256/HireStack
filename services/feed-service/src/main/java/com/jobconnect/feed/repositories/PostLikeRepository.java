package com.jobconnect.feed.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobconnect.feed.entities.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPostId(Long postId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostIdAndUserId(Long postId, Long userId);

}
