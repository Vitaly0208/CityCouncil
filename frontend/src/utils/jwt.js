// src/utils/jwt.js
import { tokenService } from "../../api/tokenService.js";

/**
 * Безопасно декодирует payload JWT (без проверки подписи)
 * Корректно обрабатывает UTF-8 (кириллицу в ролях/именах)
 * @param {string} token
 * @returns {object | null}
 */
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

/**
 * Возвращает роль текущего пользователя
 * Поддерживает стандартные .NET ClaimTypes и обычные поля
 * @returns {string | null} "Admin", "User", "Deputy" или null
 */
export const getUserRole = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    const payload = decodePayload(token);
    if (!payload) return null;

    // .NET ClaimTypes.Role
    const netRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return netRole || payload.role || null;
};

/**
 * Возвращает ID текущего пользователя
 * Используется для проверки "проголосовал ли уже этот юзер"
 * @returns {string | null}
 */
export const getUserId = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    const payload = decodePayload(token);
    if (!payload) return null;

    // .NET ClaimTypes.NameIdentifier
    const netId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    return netId || payload.sub || payload.userId || null;
};

/**
 * Проверяет, истёк ли срок действия токена
 * @returns {boolean} true если просрочен
 */
export const isTokenExpired = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    const payload = decodePayload(token);
    if (!payload?.exp) return true;

    // JWT exp хранится в секундах, Date.now() в миллисекундах
    return payload.exp < Date.now() / 1000;
};

/**
 * Быстрая проверка авторизации (токен есть + не просрочен)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    const token = tokenService.getAccessToken?.() || localStorage.getItem('accessToken');
    return !!token && !isTokenExpired();
};