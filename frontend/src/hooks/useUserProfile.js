import { useQuery } from '@tanstack/react-query';
import { userService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

/**
 * @typedef {Object} Commission
 * @property {string} committeeName
 * @property {string} appointedAt
 * @property {string|null} dismissedAt
 * @property {boolean} isChairman
 * @property {string} status
 */

/**
 * @typedef {Object} PartyActivity
 * @property {string} partyName
 * @property {string} joinedAt
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} roleName
 * @property {string} partyName
 * @property {string} memberSince
 * @property {string} homePhone
 * @property {string} workPhone
 * @property {Commission[]} commissions
 * @property {PartyActivity[]} partyActivities
 */

/**
 * Хук для получения профиля текущего авторизованного пользователя.
 * @returns {Object}
 * @returns {UserProfile|null} data - Данные профиля
 * @returns {boolean} isLoading - Индикатор загрузки
 * @returns {boolean} isError - Индикатор ошибки
 * @returns {Error|null} error - Объект ошибки
 * @returns {Function} refetch - Функция для принудительного обновления
 */
export const useUserProfile = () => {
    const query = useQuery({
        queryKey: queryKeys.users.me(),
        queryFn: () => userService.getMyProfile().then((res) => res.data),
        staleTime: 10 * 60 * 1000, // Кеш 10 минут (профиль редко меняется)
        retry: 1,
    });

    return {
        ...query,
        profile: query.data, // Удобный алиас
    };
};