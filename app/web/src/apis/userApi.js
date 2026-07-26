import axiosInstance from "../lib/axios";

export const getUserById = (id) =>
    axiosInstance.get(`/auth/${id}`);
