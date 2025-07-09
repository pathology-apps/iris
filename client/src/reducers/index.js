import {combineReducers} from 'redux'
import {reducer as form} from 'redux-form'
import acl from './AclReducer'
import bin from './BinReducer'
import comments from './CommentReducer'
import destinations from './DestinationReducer'
import drawer from './DrawerReducer'
import errors from './ErrorReducer'
import forms from './FormsReducer'
import functions from './FunctionsReducer'
import home from './HomeReducer'
import locations from './LocationReducer'
import manifests from './ManifestReducer'
import messages from './MessageReducer'
import navigation from './NavigationReducer'
import printing from './PrintingReducer'
import raw from './RawReducer'
import rooms from './RoomsReducer'
import search from './SearchReducer'
import template from './TemplateReducer'
import dashboard from './DashboardReducer'

const allReducers = combineReducers({
    acl,
    bin,
    comments,
    destinations,
    drawer,
    errors,
    forms,
    form,
    functions,
    home,
    locations,
    manifests,
    messages,
    navigation,
    printing,
    raw,
    rooms,
    search,
    template,
    dashboard,
})
/**
 * Return one super state object, containing all of our chunks of data:
 */
export default allReducers
