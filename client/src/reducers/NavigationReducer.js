const navigation = {
    openKeys: ['manifests-root', '/auth/manifests'],
    selectedKeys: [],
}

export default (state = navigation, action) => {
    switch (action.type) {
        case 'PERSIST_USER_SETTINGS':
            return action.payload.navigation ? action.payload.navigation : state
        case 'TOGGLE_LEFT_SIDEBAR':
            return {
                ...state,
                openKeys: [],
            }
        case 'SET_OPEN_KEYS':
            return {
                ...state,
                openKeys: action.payload,
            }
        case 'SET_SELECTED_KEYS':
            return {
                ...state,
                selectedKeys: action.payload,
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return navigation
        default:
            return state
    }
}
