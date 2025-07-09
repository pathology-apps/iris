const comments = {
    assets: [],
    bins: [],
}

export default (state = comments, action) => {
    switch (action.type) {
        case 'oracle/refresh:location': {
            return {
                ...state,
                bins: [].concat(
                    ...Object.keys(action.payload).map((ctx) =>
                        action.payload[ctx].filter((bin) => bin.NOTE.length),
                    ),
                ),
            }
        }
        case 'oracle/refresh:bin': {
            return {
                ...state,
                assets: action.payload.assets.filter(
                    (asset) => asset.NOTE.length,
                ),
            }
        }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return comments
        case 'oracle/JOIN_BIN':
            return {
                ...state,
                assets: [],
            }
        case 'server/JOINED_ROOM': {
            switch (action.payload.category) {
                case 'location':
                    return {
                        ...state,
                        bins: [],
                    }
                case 'bin':
                    return {
                        ...state,
                        assets: [],
                    }
                default:
                    return state
            }
        }
        case 'server/LEFT_ROOM': {
            switch (action.payload.category) {
                case 'location':
                    return comments
                case 'bin':
                    return {
                        ...state,
                        assets: [],
                    }
                default:
                    return state
            }
        }
        case 'CLOSE_PANE':
            return {
                ...state,
                assets: [],
            }
        default:
            return state
    }
}
