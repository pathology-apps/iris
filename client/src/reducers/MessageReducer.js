const messages = {
    toast: null,
    notify: null,
}

export default (state = messages, action) => {
    switch (action.type) {
        case 'oracle/notify':
            return {
                ...state,
                notify: action.payload,
            }
        case 'oracle/toast':
            return {
                ...state,
                toast: action.payload,
            }
        case 'CLEAR_TOAST':
            return {
                ...state,
                toast: null,
            }
        case 'CLEAR_NOTIFY':
            return {
                ...state,
                notify: null,
            }
        default:
            return state
    }
}
