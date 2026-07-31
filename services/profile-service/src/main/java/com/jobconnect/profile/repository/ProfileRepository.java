package com.jobconnect.profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jobconnect.profile.entities.Profile;

// BUGFIX: this interface used to be named/filed as "ProfileRespository" (missing the "o" in
// "Repository") -- a typo that shipped all the way to production. Renamed to ProfileRepository;
// the old file has been reduced to a deprecated marker (see ProfileRespository.java) instead of
// being left as a duplicate active repository bean.
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> getProfileByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);

    List<Profile> findBySkillsContaining(String skill);

    List<Profile> findByLocationContaining(String location);

    List<Profile> findBySkillsAndLocation(String skills, String location);

}
