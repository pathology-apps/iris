export const defaultState = {
    expected: [],
    current: [],
    sent: [],
    search: [],
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case 'STORE_BIN_SEARCH':
            return {
                expected: [],
                current: [],
                sent: [],
                search: action.payload,
            }
        case 'HISTORY/PUSH':
            return {
                ...state,
                expected: [],
                current: [],
                sent: [],
            }
        case 'oracle/refresh:location':
            if (window.location.pathname.includes('/auth/manifests')) {
                return {
                    expected: action.payload.expected,
                    current: action.payload.current,
                    sent: action.payload.sent,
                    search: [],
                }
            }
            return state
        case 'server/LEFT_ROOM': {
            switch (action.payload.category) {
                case 'location':
                    return defaultState
                default:
                    return state
            }
        }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return defaultState
        default:
            return state
    }
}
