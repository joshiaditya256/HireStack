package com.hirestack.auth.mapper;

import com.hirestack.auth.dto.ProfileResponse;
import com.hirestack.auth.dto.UserResponse;
import com.hirestack.auth.dto.UserSummaryResponse;
import com.hirestack.auth.entity.Profile;
import com.hirestack.auth.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                String.valueOf(user.getId()),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isVerified(),
                user.getCreatedAt());
    }

    public static UserSummaryResponse toUserSummaryResponse(User user) {
        return new UserSummaryResponse(
                String.valueOf(user.getId()),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt());
    }

    public static ProfileResponse toProfileResponse(Profile profile) {
        if (profile == null) {
            return null;
        }
        return new ProfileResponse(
                String.valueOf(profile.getId()),
                String.valueOf(profile.getUserId()),
                profile.getHeadline(),
                profile.getBio(),
                profile.getSkills(),
                profile.getExperience(),
                profile.getEducation(),
                profile.getLocation(),
                profile.getAvatarUrl(),
                profile.getCreatedAt(),
                profile.getUpdatedAt());
    }
}
