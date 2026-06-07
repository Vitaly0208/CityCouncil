import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { committeeService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';



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