const dashboard = {
    AP: {
        pendingCons: [],
        pendingSUTrans: [],
    },
}

export default (state = dashboard, action) => {
    switch (action.type) {
        case 'oracle/refresh:dashboard':
            return {
                ...state,
                [action.division]: {
                    ...state[action.division],
                    [action.dashboard]: action.payload,
                },
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return dashboard
        default:
            return state
    }
}
