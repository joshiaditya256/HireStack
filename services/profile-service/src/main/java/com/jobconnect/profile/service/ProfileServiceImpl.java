package com.jobconnect.profile.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.jobconnect.profile.dto.AvatarDTO;
import com.jobconnect.profile.dto.BannerDTO;
import com.jobconnect.profile.dto.BioDTO;
import com.jobconnect.profile.dto.EducationAddDTO;
import com.jobconnect.profile.dto.ExperienceAddDTO;
import com.jobconnect.profile.dto.HeadlineDTO;
import com.jobconnect.profile.dto.LocationDTO;
import com.jobconnect.profile.dto.ProfileUpdateDTO;
import com.jobconnect.profile.dto.SkillAddDTO;
import com.jobconnect.profile.entities.Profile;
import com.jobconnect.profile.exception.ProfileNotFoundException;
import com.jobconnect.profile.repository.ProfileRespository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

	private final ProfileRespository profilerepo;

	@Override
	public Profile addProfile(Profile profile) {
		// Check if profile already exists for this user
		Optional<Profile> existing = profilerepo.getProfileByUserId(profile.getUserId());
		if (existing.isPresent()) {
			throw new IllegalStateException("Profile already exists for this user");
		}

		System.out.println("Creating profile: " + profile);
		return profilerepo.save(profile);
	}

	@Override
	public Profile updateSkills(Long id, SkillAddDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setSkills(dto.getSkills());
		return profilerepo.save(existing);
	}

	@Override
	public Profile updateExperience(Long id, ExperienceAddDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setExperience(dto.getExperience());
		return profilerepo.save(existing);
	}

	@Override
	public Profile updateEducation(Long id, EducationAddDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setEducation(dto.getEducation());
		return profilerepo.save(existing);
	}

	@Override
	public Profile getProfile(Long id) {
		return profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));
	}

	@Override
	public Profile updateHeadline(Long id, HeadlineDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setHeadline(dto.getHeadline());
		return profilerepo.save(existing);
	}

	@Override
	public Profile updateBio(Long id, BioDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setBio(dto.getBio());
		return profilerepo.save(existing);
	}

	@Override
	public Profile getProfileByUserId(Long userId) {
		return profilerepo.getProfileByUserId(userId)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with userID: " + userId));
	}

	@Override
	public Profile updateLocation(Long id, LocationDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setLocation(dto.getLocation());
		return profilerepo.save(existing);

	}

	@Override
	public List<Profile> getAllProfiles() {
		return profilerepo.findAll();
	}

	@Override
	public Profile updateProfile(Long id, ProfileUpdateDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		if (dto.getHeadline() != null)
			existing.setHeadline(dto.getHeadline());
		if (dto.getBio() != null)
			existing.setBio(dto.getBio());
		if (dto.getExperience() != null)
			existing.setExperience(dto.getExperience());
		if (dto.getEducation() != null)
			existing.setEducation(dto.getEducation());
		if (dto.getLocation() != null)
			existing.setLocation(dto.getLocation());
		if (dto.getAvatarUrl() != null)
			existing.setAvatarUrl(dto.getAvatarUrl());
		if (dto.getBannerUrl() != null)
			existing.setBannerUrl(dto.getBannerUrl());

		return profilerepo.save(existing);
	}

	@Override
	public Profile updateAvatar(Long id, AvatarDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setAvatarUrl(dto.getAvatarUrl());
		return profilerepo.save(existing);
	}

	@Override
	public Profile updateBanner(Long id, BannerDTO dto) {
		Profile existing = profilerepo.findById(id)
				.orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));

		existing.setBannerUrl(dto.getBannerUrl());
		return profilerepo.save(existing);
	}

	@Override
	public void deleteProfile(Long id) {
		if (!profilerepo.existsById(id)) {
			throw new ProfileNotFoundException("Profile not found with id: " + id);
		}

		profilerepo.deleteById(id);
	}

	@Override
	public List<Profile> searchProfiles(String skills, String location) {
		if (skills != null && location != null) {

			return profilerepo.findBySkillsAndLocation(skills, location);
		} else if (skills != null) {

			return profilerepo.findBySkillsContaining(skills);
		} else if (location != null) {

			return profilerepo.findByLocationContaining(location);
		} else {

			return profilerepo.findAll();
		}
	}

	@Override
	public List<Profile> getByLocation(String location) {
		return profilerepo.findByLocationContaining(location);
	}

	// 17. Get by Skill
	@Override
	public List<Profile> getBySkill(String skill) {
		return profilerepo.findBySkillsContaining(skill);
	}

}
