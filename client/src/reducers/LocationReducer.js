import {setConfigData} from '@libs/global'

const locations = {}

export default (state = locations, action) => {
    switch (action.type) {
        case 'FIRST_LOGIN':
            return setConfigData('locations', action.payload)
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return locations
        default:
            return state
    }
}
