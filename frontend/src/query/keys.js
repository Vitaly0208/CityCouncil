
export const queryKeys = {
    users: {
        all: ['users'],
        lists: () => [...queryKeys.users.all, 'list'],
        list: (filters) => [...queryKeys.users.lists(), { filters }],
        details: () => [...queryKeys.users.all, 'detail'],
        detail: (id) => [...queryKeys.users.details(), id],
        me: () => [...queryKeys.users.all, 'me'],
    },
    committees: {
        all: ['committees'],
        lists: () => [...queryKeys.committees.all, 'list'],
        list: (filters) => [...queryKeys.committees.lists(), { filters }],
        details: () => [...queryKeys.committees.all, 'detail'],
        detail: (id) => [...queryKeys.committees.details(), id],
    },
};