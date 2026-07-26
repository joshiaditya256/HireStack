import axios from "axios";
import { store } from "../store"; // Import store directly
import { logout } from "../store/slices/authSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle 401s (Token Expiry)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch logout action to clear Redux state and sessionStorage
      store.dispatch(logout());

      // Optionally redirect to login, but ProtectedRoute will handle this as state updates
      // window.location.href = '/auth'; // Uncomment if strict redirect is needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
