import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { committeeService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

/**
 * @typedef {Object} CommitteeMember
 * @property {string} userId
 * @property {string} fullName
 * @property {boolean} isChairman
 * @property {string} appointedAt
 */

/**
 * @typedef {Object} InitiativeSummary
 * @property {string} id
 * @property {string} title
 * @property {string} authorName
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SessionSummary
 * @property {string} id
 * @property {string} title
 * @property {string} heldAt
 * @property {string} location
 */

/**
 * @typedef {Object} CommitteeDetail
 * @property {string} id
 * @property {string} name
 * @property {string} specialization
 * @property {string} description
 * @property {boolean} isArchived
 * @property {CommitteeMember[]} currentMembers
 * @property {CommitteeMember[]} history
 * @property {InitiativeSummary[]} acceptedInitiatives
 * @property {SessionSummary[]} upcomingSessions
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
        queryKey: queryKeys.committees.detail(id),
        queryFn: () => committeeService.getById(id).then(res => res.data),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });

    return {
        ...query,
        committee: query.data,
    };
};

export const useJoinCommittee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ committeeId, userId }) =>
            committeeService.addMember(committeeId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.committees.detail(variables.committeeId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.committees.list() });
        },
    });
};

export const useLeaveCommittee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ committeeId, userId }) =>
            committeeService.dismissMember(committeeId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.committees.detail(variables.committeeId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.committees.list() });
        },
    });
};