import profileInstance from "../lib/profileInstance";

export const getProfileByUserId = (userId) =>
  profileInstance.get(`/user/${userId}`);

export const updateHeadline = (profileId, payload) =>
  profileInstance.patch(`/${profileId}/headline`, payload);

export const updateBio = (profileId, payload) =>
  profileInstance.patch(`/${profileId}/bio`, payload);

export const updateSkills = (profileId, payload) =>
  profileInstance.put(`/me/skills/${profileId}`, payload);

export const updateExperience = (profileId, payload) =>
  profileInstance.put(`/me/experience/${profileId}`, payload);

export const updateEducation = (profileId, payload) =>
  profileInstance.put(`/me/education/${profileId}`, payload);

export const updateLocation = (profileId, payload) =>
  profileInstance.patch(`/${profileId}/location`, payload);

export const updateAvatar = (profileId, payload) =>
  profileInstance.patch(`/${profileId}/avatar`, payload);

export const updateBanner = (profileId, payload) =>
  profileInstance.patch(`/${profileId}/banner`, payload);
