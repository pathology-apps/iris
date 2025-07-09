const errors = {
    assets: [],
    bins: [],
}

export default (state = errors, action) => {
    switch (action.type) {
        case 'oracle/refresh:location': {
            return {
                ...state,
                bins: [].concat(
                    ...Object.keys(action.payload).map((ctx) =>
                        action.payload[ctx].filter((bin) => bin.ERR),
                    ),
                ),
            }
        }
        case 'oracle/refresh:bin': {
            return {
                ...state,
                assets: action.payload.assets.filter(
                    (asset) => asset.ERR || asset.CERR === 'YES',
                ),
            }
        }
        case 'CLEAR_ASSET_ERRORS':
            return {
                ...state,
                bins: [...state.bins],
                assets: [],
            }
        case 'HISTORY/PUSH':
            return errors
        case 'CLOSE_PANE':
            return {
                ...state,
                assets: [],
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return errors
        default:
            return state
    }
}
