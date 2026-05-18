import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { committeeService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

/**
 * @typedef {Object} CommitteeMember
 * @property {string} id
 * @property {string} fullName
 * @property {string} role
 * @property {string} appointedAt
 * @property {boolean} isChairman
 */

/**
 * @typedef {Object} CommitteeDetail
 * @property {string} id
 * @property {string} name
 * @property {string} specialization
 * @property {string} description
 * @property {CommitteeMember[]} members
 * @property {CommitteeMember} chairman
 * @property {boolean} isUserMember
 */

/**
 * Хук для получения данных конкретной комиссии.
 * @param {string | null | undefined} committeeId
 * @returns {Object}
 */
export const useCommittee = (committeeId) => {
    const query = useQuery({
        queryKey: queryKeys.committees.detail(committeeId),
        queryFn: () => committeeService.getById(committeeId).then((res) => res.data),
        enabled: !!committeeId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    return {
        ...query,
        committee: query.data,
    };
};
export const useCommitteeDetails = (id) => {
    const query = useQuery({
        queryKey: queryKeys.committees.details(id),
        queryFn: () => committeeService.getById(id).then(res => res.data),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
    return {...query, committee: query.data};
}
/**
 * Хук для вступления в комиссию.
 * @returns {Object} mutation
 */
export const useJoinCommittee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ committeeId, userId }) =>
            committeeService.addMember(committeeId, userId),
        onSuccess: (_, variables) => {
            // Инвалидируем кеш комиссии, чтобы обновить список членов
            queryClient.invalidateQueries(queryKeys.committees.detail(variables.committeeId));
            queryClient.invalidateQueries(queryKeys.committees.list());
        },
    });
};