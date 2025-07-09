const home = {
    accountDetailsModal: false,
    errorResolutionDrawer: false,
    firstLogin: false,
    lastAssetPaneCoords: null,
    logoutReason: '',
    oldVersion: null,
    scannerResponses: [],
    sendDiagnosticDataModal: false,
    showServerChangelog: false,
    socket: 'disconnected',
    socketError: '',
    socketFeedback: {},
    upgradeNeeded: false,
    server: {
        version: null,
        changelog: null,
    },
    upgrade: {
        version: null,
        changelog: null,
    },
    loading: {
        location: false,
    }
}

export default (state = home, action) => {
    switch (action.type) {
        case 'persist/REHYDRATE':
            if (action.payload?.home) {
                return {
                    ...action.payload.home,
                    socket: home.socket,
                    socketFeedback: home.socketFeedback,
                    socketError: home.socketError,
                }
            }
            return home
        case 'oracle/JOIN_BIN':
            return {
                ...state,
                errorResolutionDrawer: false,
            }
        case 'server/JOINED_ROOM':
            switch(action.payload.category) {
                case 'location': {
                    return {
                        ...state,
                        errorResolutionDrawer: false,
                        loading: {
                            ...state.loading,
                            location: true,
                        }
                    }
                }
                case 'bin': {
                    return {
                        ...state,
                        errorResolutionDrawer: false,
                    }
                }
            }
            return state
        case 'oracle/refresh:location':
            return {
                ...state,
                loading: {
                    ...state.loading,
                    location: false,
                }
            }
        case 'OPEN_ACCOUNT_DETAILS_MODAL':
            return {
                ...state,
                accountDetailsModal: true,
            }
        case 'CLOSE_ACCOUNT_DETAILS_MODAL':
            return {
                ...state,
                accountDetailsModal: false,
            }
        case 'OPEN_SEND_DIAGNOSTIC_DATA_MODAL':
            return {
                ...state,
                sendDiagnosticDataModal: true,
            }
        case 'CLOSE_SEND_DIAGNOSTIC_DATA_MODAL':
            return {
                ...state,
                sendDiagnosticDataModal: false,
            }
        case 'OPEN_ERROR_RESOLUTION_DRAWER':
            return {
                ...state,
                errorResolutionDrawer: true,
            }
        case 'CLOSE_ERROR_RESOLUTION_DRAWER':
            return {
                ...state,
                errorResolutionDrawer: false,
            }
        case 'HIDE_SERVER_CHANGELOG':
            return {
                ...state,
                showServerChangelog: false,
            }
        case 'SHOW_SERVER_CHANGELOG':
            return {
                ...state,
                showServerChangelog: true,
            }
        case 'APP_UPGRADE':
            return {
                ...state,
                upgradeNeeded: true,
                oldVersion: action.payload,
            }
        case 'oracle/WELCOME_PACKAGE':
            return {
                ...state,
                upgrade: {
                    ...state.server,
                    version: action.payload.serverVersion,
                    changelog: action.payload.serverChangelog,
                },
                memberID: action.payload.memberID,
            }
        case 'FIRST_LOGIN':
            return {
                ...state,
                firstLogin: true,
            }
        case 'SET_SOCKET_STATUS': {
            const {context, status} = action.payload
            return {
                ...state,
                socket: status,
                context,
                socketError:
                    action.payload.status === 'connected'
                        ? ''
                        : state.socketError,
            }
        }
        case 'SET_SOCKET_ERROR':
            return {
                ...state,
                socketError: action.payload,
            }
        case 'CLEAR_SOCKET_ERROR':
            return {
                ...state,
                socketError: null,
            }
        case 'SET_LAST_ASSET_PANE_COORDS':
            return {
                ...state,
                lastAssetPaneCoords: action.payload,
            }
        case 'CLEAR_LAST_ASSET_PANE_COORDS':
            return {
                ...state,
                lastAssetPaneCoords: null,
            }
        case 'oracle/SCANNER_RESPONSES':
            return {
                ...state,
                scannerResponses: action.payload,
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return home
        default:
            return state
    }
}
