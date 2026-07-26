package com.jobconnect.profile.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.jobconnect.profile.dto.AvatarDTO;
import com.jobconnect.profile.dto.BannerDTO;
import com.jobconnect.profile.dto.BioDTO;
import com.jobconnect.profile.dto.EducationAddDTO;
import com.jobconnect.profile.dto.ExperienceAddDTO;
import com.jobconnect.profile.dto.HeadlineDTO;
import com.jobconnect.profile.dto.LocationDTO;
import com.jobconnect.profile.dto.ProfileAddDTO;
import com.jobconnect.profile.dto.ProfileUpdateDTO;
import com.jobconnect.profile.dto.SkillAddDTO;
import com.jobconnect.profile.entities.Profile;
import com.jobconnect.profile.exception.ProfileNotFoundException;
import com.jobconnect.profile.service.ProfileService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {
	private final ProfileService service;

	@ExceptionHandler(ProfileNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleProfileNotFoundException(ProfileNotFoundException ex) {
		Map<String, String> response = new HashMap<>();
		response.put("msg", ex.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// Add Profile
	@PostMapping("/addprofile")
	public ResponseEntity<?> addProfile(@RequestBody ProfileAddDTO dto) {
		try {
			// Validate required fields
			if (dto.getUserId() == null) {
				return ResponseEntity.badRequest()
						.body(Map.of("msg", "User ID is required"));
			}

			if (dto.getHeadline() == null || dto.getHeadline().trim().isEmpty()) {
				return ResponseEntity.badRequest()
						.body(Map.of("msg", "Headline is required"));
			}

			if (dto.getBio() == null || dto.getBio().trim().isEmpty()) {
				return ResponseEntity.badRequest()
						.body(Map.of("msg", "Bio is required"));
			}

			// Convert DTO to Entity
			Profile profile = new Profile();
			profile.setUserId(dto.getUserId());
			profile.setHeadline(dto.getHeadline());
			profile.setBio(dto.getBio());
			profile.setSkills(dto.getSkills());
			profile.setExperience(dto.getExperience());
			profile.setEducation(dto.getEducation());
			profile.setLocation(dto.getLocation());
			profile.setAvatarUrl(dto.getAvatarUrl());

			Profile savedProfile = service.addProfile(profile);

			Map<String, Object> response = new HashMap<>();
			response.put("msg", "Profile created successfully");
			response.put("profile", savedProfile);

			return ResponseEntity.status(HttpStatus.CREATED).body(response);

		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(Map.of("msg", e.getMessage()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("msg", "Failed to create profile: " + e.getMessage()));
		}
	}

	// Get Profile
	@GetMapping("/{id}")
	public ResponseEntity<Profile> getProfile(@PathVariable Long id) {
		Profile profile = service.getProfile(id);
		return ResponseEntity.ok(profile);
	}

	// Get Profile by user Id
	@GetMapping("/user/{userId}")
	public ResponseEntity<Profile> getProfileByUserId(@PathVariable Long userId) {
		Profile profile = service.getProfileByUserId(userId);
		return ResponseEntity.ok(profile);
	}

	// Get all profiles
	@GetMapping
	public ResponseEntity<List<Profile>> getAllProfiles() {
		List<Profile> profiles = service.getAllProfiles();
		return ResponseEntity.ok(profiles);
	}

	// Update Complete Profile
	@PutMapping("/{id}")
	public ResponseEntity<Profile> updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateDTO dto) {
		Profile updated = service.updateProfile(id, dto);
		return ResponseEntity.ok(updated);
	}

	// Skill update
	@PutMapping("/me/skills/{id}")
	public ResponseEntity<Profile> updateSkills(@PathVariable Long id, @RequestBody SkillAddDTO dto) {
		Profile skillsUpdated = service.updateSkills(id, dto);
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(skillsUpdated);
	}

	// experience update
	@PutMapping("/me/experience/{id}")
	public ResponseEntity<Profile> updateExperience(@PathVariable Long id, @RequestBody ExperienceAddDTO dto) {
		Profile experienceUpdated = service.updateExperience(id, dto);
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(experienceUpdated);
	}

	// education update
	@PutMapping("/me/education/{id}")
	public ResponseEntity<Profile> updateEducation(@PathVariable Long id, @RequestBody EducationAddDTO dto) {
		Profile educationUpdated = service.updateEducation(id, dto);
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(educationUpdated);
	}

	// headline update
	@PatchMapping("/{id}/headline")
	public ResponseEntity<Profile> updateHeadline(@PathVariable Long id, @RequestBody HeadlineDTO dto) {
		Profile updated = service.updateHeadline(id, dto);
		return ResponseEntity.ok(updated);
	}

	// bio update
	@PatchMapping("/{id}/bio")
	public ResponseEntity<Profile> updateBio(@PathVariable Long id, @RequestBody BioDTO dto) {
		Profile updated = service.updateBio(id, dto);
		return ResponseEntity.ok(updated);
	}

	// location update
	@PatchMapping("/{id}/location")
	public ResponseEntity<Profile> updateLocation(@PathVariable Long id, @RequestBody LocationDTO dto) {
		Profile updated = service.updateLocation(id, dto);
		return ResponseEntity.ok(updated);
	}

	// avatar update
	@PatchMapping("/{id}/avatar")
	public ResponseEntity<Profile> updateAvatar(@PathVariable Long id, @RequestBody AvatarDTO dto) {
		Profile updated = service.updateAvatar(id, dto);
		return ResponseEntity.ok(updated);
	}

	// banner update
	@PatchMapping("/{id}/banner")
	public ResponseEntity<Profile> updateBanner(@PathVariable Long id,
			@RequestBody BannerDTO dto) {
		Profile updated = service.updateBanner(id, dto);
		return ResponseEntity.ok(updated);
	}

	// Delete Profile
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
		service.deleteProfile(id);
		return ResponseEntity.noContent().build();
	}

	// Search Profiles
	@GetMapping("/search")
	public ResponseEntity<List<Profile>> searchProfiles(
			@RequestParam(required = false) String skills,
			@RequestParam(required = false) String location) {
		List<Profile> profiles = service.searchProfiles(skills, location);
		return ResponseEntity.ok(profiles);
	}

	// Get by Location
	@GetMapping("/location/{location}")
	public ResponseEntity<List<Profile>> getByLocation(@PathVariable String location) {
		List<Profile> profiles = service.getByLocation(location);
		return ResponseEntity.ok(profiles);
	}

	// Get by Skill
	@GetMapping("/skill/{skill}")
	public ResponseEntity<List<Profile>> getBySkill(@PathVariable String skill) {
		List<Profile> profiles = service.getBySkill(skill);
		return ResponseEntity.ok(profiles);
	}

}
