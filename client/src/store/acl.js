import StoreRegistry from './registry/index'

// Setup our QOL acl() function for use elsewhere
export default function acl() {
    const store = StoreRegistry.get('store')
    const currentState = store.getState().acl

    const {accessToken, scanner, stationInfo, tokenStatus, workstationStatus} =
        currentState
    const session = scanner.session_id
        ? scanner.session_id
        : stationInfo.session_id

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        session,
    }

    return {
        accessToken,
        headers,
        session,
        scanner,
        stationInfo,
        tokenStatus,
        workstationStatus,
    }
}
