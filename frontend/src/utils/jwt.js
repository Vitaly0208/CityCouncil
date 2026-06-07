
import { tokenService } from "../../api/tokenService.js";

const decodePayload = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

export const getUserRole = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    const payload = decodePayload(token);
    if (!payload) return null;

    const netRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return netRole || payload.role || null;
};

export const getUserId = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    const payload = decodePayload(token);
    if (!payload) return null;

    const netId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    return netId || payload.sub || payload.userId || null;
};

export const isTokenExpired = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    const payload = decodePayload(token);
    if (!payload?.exp) return true;

    return payload.exp < Date.now() / 1000;
};

export const isAuthenticated = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    return !!token && !isTokenExpired();
};