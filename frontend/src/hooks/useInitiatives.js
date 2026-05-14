import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { initiativeService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

/**
 * @typedef {Object} Initiative
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} authorName
 * @property {string} createdAt
 * @property {string|null} approvedAt
 * @property {string|null} finalizedAt
 */

export const useInitiatives = (filters = {}) => {
    const query = useQuery({
        queryKey: queryKeys.initiatives.list(filters),
        queryFn: () => initiativeService.getAll(filters).then((res) => res.data),
        staleTime: 2 * 60 * 1000,
    });
    return { ...query, initiatives: query.data || [] };
};

export const useCreateInitiative = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => initiativeService.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.initiatives.all }),
    });
};

export const useReviewInitiative = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isApproved }) => initiativeService.review(id, { isApproved }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.initiatives.all }),
    });
};