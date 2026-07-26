package com.jobconnect.feed.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobconnect.feed.entities.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPostId(Long postId);

    java.util.List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);

}
