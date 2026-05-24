
export const queryKeys = {
    users: {
        all: ['users'],
        list: (filters) => [...queryKeys.users.all, 'list', filters].filter(Boolean),
        byCommittee: (committeeId) => [...queryKeys.users.all, 'committee', committeeId],
        details: (id) => [...queryKeys.users.all, 'detail', id],
        me: () => [...queryKeys.users.all, 'me'],
    },
    committees: {
        all: ['committees'],
        lists: () => [...queryKeys.committees.all, 'list'],
        list: (filters) => [...queryKeys.committees.lists(), { filters }],
        details: () => [...queryKeys.committees.all, 'detail'],
        detail: (id) => ['committees', 'detail', id],
    },
    initiatives: {
        all: ['initiatives'],
        lists: () => [...queryKeys.initiatives.all, 'list'],
        list: (filters) => [...queryKeys.initiatives.lists(), { filters }],
    },
    sessions: {
        all: ['sessions'],                                    // ['sessions']
        list: (filters) => [...queryKeys.sessions.all, filters], // ['sessions', {filters}]
        details: (id) => [...queryKeys.sessions.all, id],     // ['sessions', id] ← ДОЛЖНА БЫТЬ ФУНКЦИЕЙ!
    },
    voting: {
        results: (sessionId) => ['voting', 'results', sessionId],
    },
};