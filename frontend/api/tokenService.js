

const ACCESS_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

export const tokenService = {
    getAccessToken: () => sessionStorage.getItem(ACCESS_KEY),

    getRefreshToken: () => sessionStorage.getItem(REFRESH_KEY),

    setTokens: (accessToken, refreshToken) => {
        sessionStorage.setItem(ACCESS_KEY, accessToken);
        sessionStorage.setItem(REFRESH_KEY, refreshToken);
    },

    clearTokens: () => {
        sessionStorage.removeItem(ACCESS_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
    },

    isAuthenticated: () => !!sessionStorage.getItem(ACCESS_KEY),
};