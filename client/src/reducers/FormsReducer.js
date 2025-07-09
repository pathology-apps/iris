const forms = {
    breakTheGlass: {
        visible: false,
        fetching: false,
        response: {},
        successFunction: {},
    },
    createBin: {
        destination: null,
        temp: null,
        hasBins: false,
        hidden: false,
        enteringShipment: false,
        trackingNumber: '',
    },
    shipmentMethod: {
        visible: false,
        scanner: null,
        method: null,
        trackingNumber: null,
    },
}

export default (state = forms, action) => {
    switch (action.type) {
        case 'BREAK_THE_GLASS_RESPONSE':
            return {
                ...state,
                breakTheGlass: {
                    ...state.breakTheGlass,
                    response: action.payload,
                },
            }
        case 'CLOSE_SHIPMENT_DIALOG': {
            return {
                ...state,
                shipmentMethod: forms.shipmentMethod,
            }
        }
        case 'CREATING_MANIFEST':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    creating: true,
                },
            }
        case 'BREAK_THE_GLASS':
            return {
                ...state,
                breakTheGlass: {
                    ...state.breakTheGlass,
                    visible: action.payload,
                    response: {},
                    successFunction: action.successFunction
                        ? action.successFunction
                        : {},
                },
            }
        case 'FETCHING_PASSWORD_VALIDATION':
            return {
                ...state,
                breakTheGlass: {
                    ...state.breakTheGlass,
                    fetching: action.payload,
                },
            }
        case 'FIRST_LOGIN':
            return forms
        case 'MANIFEST_CREATED':
            return {
                ...state,
                createBin: forms.createBin,
            }
        case 'MANIFEST_CREATION_FAILED':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    creating: false,
                },
            }
        case 'OPEN_SHIPMENT_DIALOG':
            return {
                ...state,
                shipmentMethod: {
                    ...state.shipmentMethod,
                    visible: true,
                },
            }
        case 'SET_TRACKING_NUMBER': {
            const {method, trackingNumber} = action.payload
            return {
                ...state,
                shipmentMethod: {
                    ...state.shipmentMethod,
                    visible: false,
                    trackingNumber,
                    method,
                },
            }
        }
        case 'UPDATE_DESTINATION':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    destination: action.payload,
                },
            }
        case 'UPDATE_TEMP':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    temp: action.payload,
                },
            }
        case 'UPDATE_HIDDEN':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    hidden: action.payload,
                },
            }
        case 'UPDATE_HAS_BINS':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    hasBins: action.payload,
                },
            }
        case 'UPDATE_TRACKING_NUMBER':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    trackingNumber: action.payload,
                },
            }
        case 'FOCUS_TRACKING_NUMBER':
            return {
                ...state,
                createBin: {
                    ...state.createBin,
                    enteringShipment: action.payload,
                },
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return forms
        default:
            return state
    }
}
