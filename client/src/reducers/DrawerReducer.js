const drawer = {}

export default (state = drawer, action) => {
    switch (action.type) {
        case 'PERSIST_USER_SETTINGS':
            return action.payload.drawer ? action.payload.drawer : state
        case 'DEBUG_CLEAR_OFFSETS':
            return {
                ...state,
                [action.drawer]: {
                    ...state[action.drawer],
                    mouseOffset: null,
                },
            }
        case 'SET_INITIAL_DRAWERS_OFFSET':
            return {
                ...state,
                [action.payload.drawer]: {
                    ...state[action.payload.drawer],
                    offsets: action.payload.offsets,
                },
            }
        case 'SET_DRAWER_OFFSETS':
            return {
                ...state,
                [action.payload.drawer]: {
                    ...state[action.payload.drawer],
                    offsets: action.payload.offsets,
                },
            }
        case 'SET_MOUSE_OFFSET':
            return {
                ...state,
                [action.drawer]: {
                    ...state[action.drawer],
                    mouseOffset: action.payload,
                },
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return drawer
        default:
            return state
    }
}
