
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService, votingService } from "../../api/apiService.js";
import { queryKeys } from '../query/keys';


export const useSessions = (filters = {}) => {
    return useQuery({
        queryKey: queryKeys.sessions.all,
        queryFn: () => sessionService.getAll(filters).then(res => res.data),
        staleTime: 5 * 60 * 1000,
    });
};

export const useSessionDetails = (id) => {
    return useQuery({
        queryKey: queryKeys.sessions.details(id),
        queryFn: () => sessionService.getById(id).then(res => res.data),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
};

export const useCreateSessionWithQueue = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => sessionService.createWithQueue(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.initiatives.all });
            qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
        },
    });
};

export const useCastVote = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionId, initiativeId, voteType }) =>
            votingService.castVote({ sessionId, initiativeId, voteType }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.sessions.details(vars.sessionId) });
        },
    });
};

export const useFinalizeSession = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (sessionId) => votingService.finalize(sessionId),
        onSuccess: (_, sessionId) => {
            qc.invalidateQueries({ queryKey: queryKeys.sessions.details(sessionId) });
        },
    });
};

export const useJoinSession = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (sessionId) => sessionService.join(sessionId),
        onSuccess: (_, sessionId) => {
            qc.invalidateQueries({ queryKey: queryKeys.sessions.details(sessionId) });
        }
    });
};

export const useLeaveSession = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (sessionId) => sessionService.leave(sessionId),
        onSuccess: (_, sessionId) => {
            qc.invalidateQueries({ queryKey: queryKeys.sessions.details(sessionId) });
            qc.invalidateQueries({ queryKey: ['profile'] });
        }
    });
};
export const useSessionAttendees = (sessionId) => {
    return useQuery({
        queryKey: ['sessions', sessionId, 'attendees'],
        queryFn: () => sessionService.getAttendees(sessionId).then(res => res.data),
        enabled: !!sessionId,
        staleTime: 30 * 1000
    });
};

export const useSessionProtocol = (sessionId) => {
    return useQuery({
        queryKey: queryKeys.sessions.protocol(sessionId),
        queryFn: () => sessionService.getProtocol(sessionId).then(res => res.data),
        enabled: !!sessionId,
        staleTime: 5 * 60 * 1000,
    });
};