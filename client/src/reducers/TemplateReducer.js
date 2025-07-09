import AssetTypes from '@organizers/sorters/AssetTypes'
import ManifestTypes from '@organizers/sorters/ManifestTypes'

const template = {
    collapsedLeft: false,
    collapsedRight: false,
    debugModeEnabled: false,
    glassBreaking: false,
    manifestFilter: [],
    manifestSorter: {
        expected: ManifestTypes.Destination,
        current: ManifestTypes.Destination,
        sent: ManifestTypes.Destination,
        search: ManifestTypes.Destination,
    },
    assetSorter: AssetTypes.TimestampReverse,
    printModal: false,
    printId: null,
    selectedAsset: {},
    selectedAssetDetails: {},
    showJourney: false,
    theme: 'pt-goblue',
    volume: 100,
}

export default (state = template, action) => {
    switch (action.type) {
        case 'FIRST_LOGIN':
            return {
                ...state,
                glassBreaking: false,
                printModal: false,
                selectedAsset: {},
                selectedAssetDetails: {},
                logoutReason: '',
            }
        case 'chat/leave':
            if (action.payload.category === 'bin') {
                return {
                    ...state,
                    selectedAsset: {},
                }
            }
            return state
        case 'SET_VOLUME':
            return {
                ...state,
                volume: action.payload,
            }
        case 'GLASS_BREAKING':
            return {
                ...state,
                glassBreaking: action.payload,
            }
        case 'PERSIST_USER_SETTINGS':
            return action.payload.template ? action.payload.template : state
        case 'TOGGLE_JOURNEY':
            return {
                ...state,
                showJourney: action.payload,
            }
        case 'server/JOINED_ROOM':
            if (action.payload.category !== 'bin') {
                return state
            }
            return {
                ...state,
                selectedAsset: {},
            }
        case 'OPEN_PRINT_MODAL':
            return {
                ...state,
                printModal: true,
                printId: action.manifestId,
            }
        case 'CLOSE_PRINT_MODAL':
            return {
                ...state,
                printModal: false,
                printId: null,
            }
        case 'CLOSE_PANE':
            return {
                ...state,
                selectedAsset: {},
                selectedAssetDetails: {},
            }
        case 'CLEAR_SELECTED_ASSET':
            return {
                ...state,
                selectedAsset: {},
                selectedAssetDetails: {},
            }
        case 'ENABLE_DEBUG_MODE':
            return {
                ...state,
                debugModeEnabled: action.payload,
            }
        case 'SET_MANIFEST_FILTER':
            return {
                ...state,
                manifestFilter: action.payload,
            }
        case 'SET_MANIFEST_SORTER':
            return {
                ...state,
                manifestSorter: {
                    ...state.manifestSorter,
                    [action.category]: action.payload,
                },
            }
        case 'SET_ASSET_SORTER':
            return {
                ...state,
                assetSorter: action.payload,
            }
        case 'TOGGLE_LEFT_SIDEBAR':
            return {
                ...state,
                collapsedLeft: !state.collapsedLeft,
            }
        case 'TOGGLE_RIGHT_SIDEBAR':
            return {
                ...state,
                collapsedRight: !state.collapsedRight,
            }
        case 'ASSET_CLICKED':
            return {
                ...state,
                selectedAsset: action.payload,
            }
        case 'CLOSE_ASSET_DETAILS':
            return {
                ...state,
                selectedAssetDetails: {},
            }
        case 'CLICKING_ASSET_DETAILS':
            return {
                ...state,
                selectedAssetDetails: {},
            }
        case 'oracle/ASSET_DETAILS_CLICKED':
            return {
                ...state,
                selectedAssetDetails: action.payload,
            }
        case 'SET_THEME':
            return {
                ...state,
                theme: action.payload,
            }
        case 'SET_OPEN_KEYS':
            return {
                ...state,
                collapsedLeft: action.payload.length
                    ? false
                    : state.collapsedLeft,
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return template
        default:
            return state
    }
}
