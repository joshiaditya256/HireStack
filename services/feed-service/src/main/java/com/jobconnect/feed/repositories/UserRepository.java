package com.jobconnect.feed.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobconnect.feed.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
