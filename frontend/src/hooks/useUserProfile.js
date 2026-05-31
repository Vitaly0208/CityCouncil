import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

export const useUserProfile = (targetUserId = null) => {
    const queryKey = targetUserId
        ? queryKeys.users.details(targetUserId)
        : queryKeys.users.me();

    const queryFn = targetUserId
        ? () => userService.getProfile(targetUserId).then(res => res.data)
        : () => userService.getMyProfile().then(res => res.data);

    const query = useQuery({
        queryKey,
        queryFn,
        staleTime: 10 * 60 * 1000,
        retry: 1,
        enabled: !targetUserId || !!targetUserId,
    });

    return {
        ...query,
        profile: query.data,
    };
};
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }) => userService.updateProfile(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
        },
        retry: 1,
    });

    return {
        ...mutation,
        updateProfile: mutation.mutate,
        updateProfileAsync: mutation.mutateAsync,
    };
};