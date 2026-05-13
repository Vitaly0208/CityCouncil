export const API_URL = 'http://localhost:8080';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
    },
    USERS: {
        PROFILE: (id) => `/api/users/${id}`,
        ME: '/api/users/me',
    },
    COMMITTEES: {
        BASE: '/api/committees',
        DETAILS: (id) => `/api/committees/${id}`,
        MEMBERS: (id) => `/api/committees/${id}/members`,
        CHAIRMAN: (id) => `/api/committees/${id}/chairman`,
    },
};