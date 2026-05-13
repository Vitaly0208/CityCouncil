const ACCESS_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

export const tokenService = {
    getAccessToken: () => localStorage.getItem(ACCESS_KEY),

    getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem(ACCESS_KEY, accessToken);
        localStorage.setItem(REFRESH_KEY, refreshToken);
    },

    clearTokens: () => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },

    isAuthenticated: () => !!localStorage.getItem(ACCESS_KEY),
};