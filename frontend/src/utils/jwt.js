import { tokenService} from "../../api/tokenService.js";

export const getUserRole = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const { role } = JSON.parse(jsonPayload);
        return role || null;
    } catch {
        console.warn('Не удалось декодировать JWT');
        return null;
    }
};