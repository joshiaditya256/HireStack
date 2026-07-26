package com.jobconnect.profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jobconnect.profile.entities.Profile;

@Repository
public interface ProfileRespository extends JpaRepository<Profile, Long> {

    Optional<Profile> getProfileByUserId(Long userId);
    
    boolean existsByUserId(Long userId);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
	
    List<Profile> findBySkillsContaining(String skill);
    
    List<Profile> findByLocationContaining(String location);
    
    List<Profile> findBySkillsAndLocation(String skills, String location);
	
	
}
