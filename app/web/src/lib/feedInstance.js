import axios from "axios";

const feedInstance = axios.create({
    baseURL: import.meta.env.VITE_FEED_SERVICE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

feedInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default feedInstance;
