package com.jobconnect.feed.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.jobconnect.feed.entities.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
	@Query("SELECT p FROM Post p JOIN FETCH p.user u LEFT JOIN FETCH u.profile ORDER BY p.createdAt DESC")
    Page<Post> findAllWithUser(Pageable pageable);
	
    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    

}
