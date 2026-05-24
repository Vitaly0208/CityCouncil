import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { committeeService } from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

export const useCommittees = (filters = {}) => {
    const query = useQuery({
        queryKey: filters && Object.keys(filters).length > 0
            ? queryKeys.committees.list(filters)
            : queryKeys.committees.all,
        queryFn: () => committeeService.getAll(filters).then(res => res.data),
        staleTime: 5 * 60 * 1000,
    });

    return {
        ...query,
        committees: query.data || []
    };
};

export const useCommittee = (id) => {
    return useQuery({
        queryKey: queryKeys.committees.details(id),
        queryFn: () => committeeService.getById(id).then(res => res.data),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
};

export const useCreateCommittee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => committeeService.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.committees.all });
        },
        onError: (error) => {
            console.error('Ошибка создания комиссии:', error);
        }
    });
};

export const useDeleteCommittee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => committeeService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.committees.all });
            qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
        },
        onError: (error) => {
            console.error('Ошибка удаления комиссии:', error);
        }
    });
};

export const useAddCommitteeMember = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ committeeId, userId }) =>
            committeeService.addMember(committeeId, userId),
        onSuccess: (_, { committeeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.committees.details(committeeId) });
        }
    });
};

export const useRemoveCommitteeMember = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ committeeId, userId }) =>
            committeeService.dismissMember(committeeId, userId),
        onSuccess: (_, { committeeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.committees.details(committeeId) });
        }
    });
};

export const useAppointChairman = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ committeeId, userId }) =>
            committeeService.appointChairman(committeeId, userId),
        onSuccess: (_, { committeeId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.committees.detail(committeeId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.byCommittee(committeeId) });
        },
    });
};