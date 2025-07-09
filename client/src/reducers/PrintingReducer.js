const printing = {
    assets: [],
    manifest: {},
}

export default (state = printing, action) => {
    switch (action.type) {
        case 'BIN_PRINTED':
            return action.payload
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return printing
        default:
            return state
    }
}
