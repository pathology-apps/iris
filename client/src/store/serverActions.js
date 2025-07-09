import StoreRegistry from '@store/registry/index'

export default async function serverActions(action) {
    const Rooms = StoreRegistry.get('rooms')
    const store = StoreRegistry.get('store')
    const {dispatch, getState} = store
    const {acl, bin} = getState()
    dispatch(action)
    switch (action.type) {
        case 'oracle/JOIN_BIN_CHILD':
            // eslint-disable-next-line no-console
            console.info(
                `Received instructions to join bin child ${action.payload} from server.`,
            )
            Rooms.Sub(`binChild:${action.payload}`)
            break
        default:
            break
    }
}
