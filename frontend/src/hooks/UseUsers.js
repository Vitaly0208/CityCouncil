import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

export const useUsers = (filters = {}) => {
    return useQuery({
        queryKey: queryKeys.users.list(filters),
        queryFn: () => userService.getAll(filters).then(res => res.data),
        staleTime: 2 * 60 * 1000,
    });
};

export const useUsersByCommittee = (committeeId) => {
    return useQuery({
        queryKey: queryKeys.users.byCommittee(committeeId),
        queryFn: () => userService.getByCommittee(committeeId).then(res => res.data),
        enabled: !!committeeId,
        staleTime: 2 * 60 * 1000,
    });
};

export const useAddUserToCommittee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, committeeId }) =>
            userService.addToCommittee(userId, committeeId),
        onSuccess: (_, { committeeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.users.byCommittee(committeeId) });
            qc.invalidateQueries({ queryKey: queryKeys.committees.all });
        },
    });
};

export const useRemoveUserFromCommittee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, committeeId }) =>
            userService.removeFromCommittee(userId, committeeId),
        onSuccess: (_, { committeeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.users.byCommittee(committeeId) });
            qc.invalidateQueries({ queryKey: queryKeys.committees.all });
        },
    });
};