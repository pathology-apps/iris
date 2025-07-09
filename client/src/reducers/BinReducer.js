const bin = {
    assets: [],
    trip: [],
    manifest: {},
    assetPaneVisible: false,
    previewMode: true,
    reconcileModal: false,
    assetToReconcile: null,
    children: [],
    childModal: false,
    childParent: {},
    removingChild: null,
    promotingChild: null,
}

export default (state = bin, action) => {
    switch (action.type) {
        case 'HISTORY/PUSH':
            return bin
        case 'CLOSE_ASSET_CHILDREN_MODAL':
            return {
                ...state,
                childModal: false,
                childParent: {},
            }
        case 'PROMOTING_CHILD_ASSET':
            return {
                ...state,
                promotingChild: action.childBarcode,
            }
        case 'REMOVING_CHILD_ASSET':
            return {
                ...state,
                removingChild: action.childBarcode,
            }
        case 'STARTING_CHILD_ASSET':
            return {
                ...state,
                childModal: true,
                removingChild: null,
                promotingChild: null,
            }
        case 'oracle/refresh:binChild':
            return {
                ...state,
                childParent: action.payload.parent_asset,
                children: action.payload.child_assets,
                removingChild: null,
                promotingChild: null,
            }
        case 'oracle/asset-children:open':
            return {
                ...state,
                childModal: true,
            }
        case 'OPEN_RECONCILE_MODAL':
            return {
                ...state,
                reconcileModal: true,
                assetToReconcile: action.payload,
            }
        case 'CLOSE_RECONCILE_MODAL':
            return {
                ...state,
                reconcileModal: false,
                assetToReconcile: null,
            }
        case 'oracle/refresh:bin':
            if (action.payload.bin.STS === 'IS_INUSE') {
                return {
                    ...state,
                    previewMode: false,
                    assets: action.payload.assets,
                    manifest: action.payload.bin,
                    trip: action.payload.TRIP,
                }
            }
            return {
                ...state,
                assets: action.payload.assets,
                manifest: action.payload.bin,
                trip: action.payload.TRIP,
            }
        case 'chat/leave':
            if (action.payload.category === 'bin') {
                return bin
            }
            return state
        case 'OPEN_PANE':
            return {
                ...bin,
                assetPaneVisible: true,
            }
        case 'OPEN_PANE_PREVIEW':
            return {
                ...bin,
                assetPaneVisible: true,
                previewMode: true,
            }
        case 'server/JOINED_ROOM': {
            switch (action.payload.category) {
                case 'bin':
                    return {
                        ...bin,
                        previewMode: true,
                        assetPaneVisible: true,
                        reconcileModal: false,
                        assetToReconcile: null,
                    }
                case 'location':
                    return bin
                default:
                    return state
            }
        }
        case 'server/LEFT_ROOM': {
            switch (action.payload.category) {
                case 'bin':
                case 'location':
                    return bin
                default:
                    return state
            }
        }
        case 'oracle/preview-mode':
            /**
             * Some cleanup:
             */
            if (action.payload === 'true' || action.payload === 'false') {
                action.payload = JSON.parse(action.payload)
            }
            return {
                ...state,
                previewMode: action.payload,
            }
        case 'FIRST_LOGIN':
            return bin
        case 'CLOSE_PANE':
            return bin
        case 'oracle/JOIN_BIN':
            return {
                ...state,
                reconcileModal: false,
                assetToReconcile: null,
                assetPaneVisible: true,
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return bin
        default:
            return state
    }
}
