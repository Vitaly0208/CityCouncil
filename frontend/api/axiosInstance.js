import axios from "axios";
import { API_URL, ENDPOINTS } from "./endpoints";
import { tokenService } from "./tokenService";

let isRefreshing = false;
let refreshSubscribers = [];

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: false,
    timeout: 10000,
});

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

function onRefreshFailed(error) {
    refreshSubscribers.forEach((cb) => cb(null, error));
    refreshSubscribers = [];
}

axiosInstance.interceptors.request.use((config) => {
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const is401 = error.response?.status === 401;
        const isRefreshRequest = originalRequest.url === ENDPOINTS.AUTH.REFRESH;

        if (!is401 || originalRequest._retry || isRefreshRequest) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken, err) => {
                    if (err) reject(err);
                    else {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(axiosInstance(originalRequest));
                    }
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshToken = tokenService.getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            const response = await axiosInstance.post(ENDPOINTS.AUTH.REFRESH, {
                token: refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            tokenService.setTokens(accessToken, newRefreshToken);
            onRefreshed(accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);

        } catch (err) {
            tokenService.clearTokens();
            onRefreshFailed(err);
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;