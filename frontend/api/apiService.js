import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "./endpoints";
import { tokenService } from "./tokenService";

export const toFormData = (data) => {
    if (data instanceof FormData) return data;
    const formData = new FormData();
    if (!data) return formData;
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (value instanceof File || value instanceof Blob) {
                formData.append(key, value, value.name);
            } else {
                formData.append(key, value);
            }
        }
    });
    return formData;
};

export const authService = {
    login: (credentials) => axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => axiosInstance.post(ENDPOINTS.AUTH.REGISTER, userData),
    logout: () => axiosInstance.post(ENDPOINTS.AUTH.LOGOUT),
    refresh: () => axiosInstance.post(ENDPOINTS.AUTH.REFRESH, {
        token: tokenService.getRefreshToken(),
    }),
};

export const userService = {
    getProfile: (id) => axiosInstance.get(ENDPOINTS.USERS.PROFILE(id)),
    getMyProfile: () => axiosInstance.get(ENDPOINTS.USERS.ME),
    updateProfile: (id, data) =>
        axiosInstance.put(ENDPOINTS.USERS.UPDATE(id), data),
    getAll: (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        return axiosInstance.get(ENDPOINTS.USERS.BASE, { params: cleanParams });
    },
    getByCommittee: (committeeId) =>
        axiosInstance.get(`${ENDPOINTS.USERS.BASE}/by-committee/${committeeId}`),
    addToCommittee: (userId, committeeId) =>
        axiosInstance.post(ENDPOINTS.COMMITTEES.MEMBERS(committeeId), { userId }),
    removeFromCommittee: (userId, committeeId) =>
        axiosInstance.delete(`${ENDPOINTS.COMMITTEES.MEMBERS(committeeId)}/${userId}`),
};

export const committeeService = {
    getAll: () => axiosInstance.get(ENDPOINTS.COMMITTEES.BASE),
    getById: (id) => axiosInstance.get(ENDPOINTS.COMMITTEES.DETAILS(id)),
    create: (data) => axiosInstance.post(ENDPOINTS.COMMITTEES.BASE, data),
    delete: (id) => axiosInstance.delete(ENDPOINTS.COMMITTEES.DETAILS(id)),
    update: (id, data) => axiosInstance.put(ENDPOINTS.COMMITTEES.DETAILS(id), data),
    addMember: (committeeId, userId) =>
        axiosInstance.post(ENDPOINTS.COMMITTEES.MEMBERS(committeeId), { userId }),
    appointChairman: (committeeId, userId) =>
        axiosInstance.post(ENDPOINTS.COMMITTEES.CHAIRMAN(committeeId), { userId }),
    dismissMember: (committeeId, userId) =>
        axiosInstance.delete(`${ENDPOINTS.COMMITTEES.MEMBERS(committeeId)}/${userId}`),
};

export const partyService = {
    getAll: () => axiosInstance.get(ENDPOINTS.PARTIES.BASE),
    getById: (id) => axiosInstance.get(ENDPOINTS.PARTIES.DETAILS(id)),
    create: (data) => axiosInstance.post(ENDPOINTS.PARTIES.BASE, data),
    delete: (id) => axiosInstance.delete(ENDPOINTS.PARTIES.DETAILS(id)),
    update: (id, data) => axiosInstance.put(ENDPOINTS.PARTIES.DETAILS(id), data),
    addMember: (partyId, userId) =>
        axiosInstance.post(ENDPOINTS.PARTIES.MEMBERS(partyId), { userId }),
    removeMember: (partyId, userId) =>
        axiosInstance.delete(`${ENDPOINTS.PARTIES.MEMBERS(partyId)}/${userId}`),
    getUserParties: (userId) =>
        axiosInstance.get(ENDPOINTS.PARTIES.USER_PARTIES(userId)),
};

export const initiativeService = {
    getAll: (params) => axiosInstance.get(ENDPOINTS.INITIATIVES.BASE, { params }),
    create: (data) => axiosInstance.post(ENDPOINTS.INITIATIVES.CREATE, data),
    review: (id, data) => axiosInstance.put(ENDPOINTS.INITIATIVES.REVIEW(id), data),
};

export const sessionService = {
    getAll: (params = {}) => axiosInstance.get(ENDPOINTS.SESSIONS.BASE, { params }),
    getById: (id) => axiosInstance.get(ENDPOINTS.SESSIONS.DETAILS(id)),
    create: (data) => axiosInstance.post(ENDPOINTS.SESSIONS.CREATE, data),
    createWithQueue: (data) => axiosInstance.post(ENDPOINTS.SESSIONS.CREATE_WITH_QUEUE, data),
    getProtocol: (id) => axiosInstance.get(ENDPOINTS.SESSIONS.PROTOCOL(id)),
    join: (sessionId) =>
        axiosInstance.post(ENDPOINTS.SESSIONS.JOIN(sessionId)),
    leave: (sessionId) => axiosInstance.patch(ENDPOINTS.SESSIONS.LEAVE(sessionId)),
    getAttendees: (sessionId) =>
        axiosInstance.get(ENDPOINTS.SESSIONS.ATTENDEES(sessionId)),
};

export const votingService = {
    castVote: (data) => axiosInstance.post(ENDPOINTS.VOTING.CAST, data),
    finalize: (sessionId) => axiosInstance.post(ENDPOINTS.VOTING.FINALIZE(sessionId)),
};
export const ratingService = {
    getLeaderboard: async (limit = 100) => {
        const response = await axiosInstance.get(ENDPOINTS.RATING.LEADERBOARD, {
            params: { limit }
        });
        return response.data;
    }
};