import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partyService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

export const useParties = (options = {}) => {
    const query = useQuery({
        queryKey: queryKeys.parties.all(),
        queryFn: () => partyService.getAll().then(res => res.data),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
    return {
        ...query,
        parties: query.data || []
    };
};


export const usePartyDetails = (id, options = {}) => {
    const query = useQuery({
        queryKey: queryKeys.parties.detail(id),
        queryFn: () => partyService.getById(id).then(res => res.data),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
        ...options,
    });

    return {
        ...query,
        party: query.data
    };
};


export const useUserParties = (userId, options = {}) => {
    return useQuery({
        queryKey: queryKeys.parties.byUser(userId),
        queryFn: () => partyService.getUserParties(userId).then((res) => res.data),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000,
        ...options,
    });
};

export const useCreateParty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => partyService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.all() });
        },
    });
};

export const useDeleteParty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => partyService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.all() });
        },
    });
};

export const useJoinParty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ partyId, userId }) => partyService.addMember(partyId, userId),
        onSuccess: (_, { partyId, userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.detail(partyId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.byUser(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.all() });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useLeaveParty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ partyId, userId }) => partyService.removeMember(partyId, userId),
        onSuccess: (_, { partyId, userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.detail(partyId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.byUser(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.parties.all() });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};