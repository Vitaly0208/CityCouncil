import { useQuery } from '@tanstack/react-query';
import { committeeService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

/**
 * @typedef {Object} Committee
 * @property {string} id
 * @property {string} name
 * @property {string} specialization
 * @property {string} description
 * @property {number} memberCount
 * @property {string} chairmanName
 */

/**
 * Хук для получения списка комиссий.
 * @param {Object} filters - Параметры фильтрации
 * @returns {Object}
 */
export const useCommittees = (filters = {}) => {
    const query = useQuery({
        queryKey: queryKeys.committees.list(filters),
        queryFn: () => committeeService.getAll(filters).then((res) => res.data),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    return {
        ...query,
        committees: query.data?.items || query.data || [],
    };
};