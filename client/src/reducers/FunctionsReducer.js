const functions = []

export default (state = functions, action) => {
    switch (action.type) {
        case 'FIRST_LOGIN':
            return action.payload.functions
        case 'oracle/DEVICE_FUNCTIONS':
            return action.payload
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return functions
        default:
            return state
    }
}
