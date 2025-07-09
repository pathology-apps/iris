const raw = {
    locations: [],
    activeSessions: [],
    scans: [],
}

export default (state = raw, action) => {
    switch (action.type) {
        case 'FIRST_LOGIN':
            return {
                ...state,
                locations: action.payload.locations,
            }
        case 'oracle/ACTIVE_USERS':
            return {
                ...state,
                activeSessions: action.payload,
            }
        case 'oracle/scan':
            try {
                const scans = JSON.parse(action.payload)
                return {
                    ...state,
                    scans: scans.reverse(),
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(
                    `Couldn't parse json for event '${action.type}': ${error.message}`,
                )
                return state
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return raw
        default:
            return state
    }
}
