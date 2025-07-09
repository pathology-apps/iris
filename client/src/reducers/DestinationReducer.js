import {setConfigData} from '@libs/global'

const destinations = {}

export default (state = destinations, action) => {
    switch (action.type) {
        case 'FIRST_LOGIN':
            return setConfigData('destinations', action.payload)
        case 'oracle/CONFIG_DATA':
            return setConfigData('payload', action)
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return destinations
        default:
            return state
    }
}
