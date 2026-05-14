import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService} from "../../api/apiService.js";
import { queryKeys } from '../query/keys';

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