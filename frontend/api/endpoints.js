export const API_URL = 'http://localhost:8080';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
    },

    USERS: {
        BASE: '/api/users',
        PROFILE: (id) => `/api/users/${id}`,
        ME: '/api/users/me',
        UPDATE: (userId) => `/api/users/${userId}`,
        BY_ROLE: (role) => `/api/users?role=${role}`,
        SEARCH: (query) => `/api/users?search=${encodeURIComponent(query)}`,
    },

    COMMITTEES: {
        BASE: '/api/committees',
        DETAILS: (id) => `/api/committees/${id}`,
        MEMBERS: (id) => `/api/committees/${id}/members`,
        CHAIRMAN: (id) => `/api/committees/${id}/chairman`,
    },

    INITIATIVES: {
        BASE: '/api/initiatives',
        CREATE: '/api/initiatives',
        REVIEW: (id) => `/api/initiatives/${id}/review`,
        BY_STATUS: (status) => `/api/initiatives?status=${status}`,
    },

    SESSIONS: {
        BASE: '/api/sessions',
        DETAILS: (id) => `/api/sessions/${id}`,
        CREATE: '/api/sessions/create',
        CREATE_WITH_QUEUE: '/api/sessions/create-with-queue',
        JOIN: (id) => `/api/sessions/${id}/join`,
        LEAVE: (id) => `/api/sessions/${id}/leave`,
        ATTENDEES: (id) => `/api/sessions/${id}/attendees`,
        PROTOCOL: (id) => `/api/sessions/${id}/protocol`,
    },

    PARTIES: {
        BASE: '/api/parties',
        DETAILS: (id) => `/api/parties/${id}`,
        MEMBERS: (id) => `/api/parties/${id}/members`,
        USER_PARTIES: (userId) => `/api/parties/user/${userId}`,
    },

    VOTING: {
        CAST: '/api/voting/cast',
        FINALIZE: (sessionId) => `/api/voting/finalize/${sessionId}`,
        RESULTS: (sessionId) => `/api/voting/results/${sessionId}`,
    },
    RATING: {
        LEADERBOARD: '/api/rating/leaderboard'
    }
};