import {jwtDecode} from 'jwt-decode'
// eslint-disable-next-line import/no-extraneous-dependencies
import pkg from '@project/version.json'

export const defaultState = {
    tokenStatus: null,
    workstationStatus: null,
    accessToken: null,
    tokenLastRefreshed: null,
    details: {},
    scanner: {},
    stationInfo: {},
    server: {
        version: pkg.version,
        changelog: null,
    },
}

let details

export default (state = defaultState, action) => {
    switch (action.type) {
        case 'oracle/WELCOME_PACKAGE':
            return {
                ...state,
                server: {
                    ...state.server,
                    version: action.payload.serverVersion,
                    changelog: action.payload.serverChangelog,
                },
            }

        case 'FIRST_LOGIN':
            return {
                ...state,
                accessToken: action.payload.token,
                details: action.payload.details,
                stationInfo: action.payload.workstation_info,
            }

        case 'REFRESHING_WORKSTATION':
            return {
                ...state,
                workstationStatus: 'FETCHING',
            }

        case 'REFRESHING_TOKEN':
            return {
                ...state,
                tokenStatus: 'FETCHING',
            }

        case 'TOKEN_REFRESH_FAILED':
            return {
                ...state,
                tokenStatus: null,
            }
        case 'TOKEN_STORED':
            details = jwtDecode(action.payload.token)
            return {
                ...state,
                accessToken: action.payload.token,
                stationInfo: action.payload,
                details,
                tokenStatus: null,
            }
        case 'TOKEN_REFRESHED':
            details = jwtDecode(action.payload.accessToken)
            return {
                ...state,
                accessToken: action.payload.accessToken,
                details,
                tokenStatus: null,
                tokenLastRefreshed: new Date(),
            }
        case 'WORKSTATION_REFRESHED':
            return {
                ...state,
                stationInfo: action.payload,
                workstationStatus: null,
            }
        case 'STORE_SCANNER':
            return {
                ...state,
                scanner: action.payload,
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return defaultState
        default:
            return state
    }
}
