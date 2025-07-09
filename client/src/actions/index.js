/**
 * This file houses all the interactions with our interface. It provides a single
 * source of truth for all changes to our store/state.
 *
 * Actions:
 * 1. Actions are payloads of information that send data from your application to your store.
 * 2. They are the only source of information for the store.
 * 3. Actions are plain JavaScript objects.
 * 4. Actions must have a type property that indicates the type of action being performed.
 * 5. Types should typically be defined as string constants.
 */
import React from 'react'
import acl from '@store/acl'
import axios from 'axios'
import {notification, Button} from 'antd'
import {CopyOutlined} from '@ant-design/icons'

export const APIVersion = 'v2'
export const API_SEGMENT = `/api`

function invalidResponse(context, message) {
    const errorMessage = `Error: ${context}\nTimestamp: ${new Date().toLocaleString()}\n\n${message}`

    const copyToClipboard = (errorDetails) => {
        navigator.clipboard.writeText(errorDetails).then(
            () => {
                notification.success({
                    message: 'Copied to Clipboard',
                    description:
                        'The error details have been copied to your clipboard.',
                })
            },
            () => {
                notification.error({
                    message: 'Failed to Copy',
                    description: 'Please copy the error details manually.',
                })
            },
        )
    }

    notification.error({
        duration: 30,
        message: 'Request Failed',
        style: {
            width: '40vw',
        },
        description: (
            <div>
                <div style={{marginBottom: '10px'}}>
                    An error occurred. The details are provided below which you
                    can copy and send to our support team.
                </div>
                <div
                    style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        backgroundColor: '#f0f0f0',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '.9em',
                    }}
                >
                    <pre
                        style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {errorMessage}
                    </pre>
                </div>
                <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    style={{margin: '10px 0'}}
                    onClick={() => copyToClipboard(errorMessage)}
                >
                    Copy Error Details
                </Button>
                <hr />
                <div>
                    Please try to perform this action again. If you continue to
                    receive this message, contact our support team at{' '}
                    <a href="mailto:PathTrack-Support@med.umich.edu">
                        PathTrack-Support@med.umich.edu
                    </a>
                    .
                </div>
            </div>
        ),
    })
}

export const _go = (
    context,
    url,
    data = null,
    session = null,
    customHeaders = {},
) => {
    const {headers} = acl()

    if (session) {
        headers.session = session
    }
    const finalHeaders = {...headers, ...customHeaders}

    const api = axios.create({
        headers: finalHeaders,
        withCredentials: true,
    })

    return api[context](`${API_SEGMENT}${url}`, data)
        .then((response) => {
            if (response && response.data && response.data.payload) {
                Object.keys(response.data.payload).map((k) => {
                    if (response.data.payload[k].error) {
                        const {message, error_message} =
                            response.data.payload[k]
                        invalidResponse(message, error_message)
                        return Promise.reject(response)
                    }
                    return true
                })
            }
            if (response?.data?.error) {
                const {error, message} = response.data
                invalidResponse(error, message)
                return Promise.reject(response)
            }
            return response
        })
        .catch((err) => {
            if (err.response?.data?.error) {
                invalidResponse(err.message, err.response.data.message)
                return Promise.reject(err)
            }
            return err
        })
}

/** Error Resolution * */
export const openErrorResolutionDrawer = () => ({
    type: 'OPEN_ERROR_RESOLUTION_DRAWER',
})
export const closeErrorResolutionDrawer = () => ({
    type: 'CLOSE_ERROR_RESOLUTION_DRAWER',
})
export const openAccountDetailsModal = () => ({
    type: 'OPEN_ACCOUNT_DETAILS_MODAL',
})
export const closeAccountDetailsModal = () => ({
    type: 'CLOSE_ACCOUNT_DETAILS_MODAL',
})
export const openSendDiagnosticDataModal = () => ({
    type: 'OPEN_SEND_DIAGNOSTIC_DATA_MODAL',
})
export const closeSendDiagnosticDataModal = () => ({
    type: 'CLOSE_SEND_DIAGNOSTIC_DATA_MODAL',
})

/** ACL */
export const firstLogin = (payload) => ({
    type: 'FIRST_LOGIN',
    payload,
})
export const tokenStored = (payload) => ({
    type: 'TOKEN_STORED',
    payload,
})
export const enableDebugMode = (debugModeEnabled) => ({
    type: 'ENABLE_DEBUG_MODE',
    payload: debugModeEnabled,
})
export const clearingSettings = () => ({type: 'CLEARING_SETTINGS'})
export const settingsCleared = () => ({type: 'SETTINGS_CLEARED'})
export const expireSession = () => ({type: 'EXPIRE_SESSION'})
export const refreshingScanner = () => ({type: 'REFRESHING_SCANNER'})
export const refreshingToken = () => ({type: 'REFRESHING_TOKEN'})
export const tokenRefreshFailed = () => ({type: 'TOKEN_REFRESH_FAILED'})
export const tokenRefreshed = (token) => ({
    type: 'TOKEN_REFRESHED',
    payload: token,
})
export const refreshingWorkstation = () => ({type: 'REFRESHING_WORKSTATION'})
export const workstationRefreshed = (station) => ({
    type: 'WORKSTATION_REFRESHED',
    payload: station,
})
export const storeScanner = (myScanner) => ({
    type: 'STORE_SCANNER',
    payload: myScanner,
})

/** AJAX responses */
export const commentCreated = (response) => ({
    type: 'COMMENT_CREATED',
    payload: response,
})
export const creatingManifest = () => ({
    type: 'CREATING_MANIFEST',
})
export const manifestCreated = (response) => ({
    type: 'MANIFEST_CREATED',
    payload: response,
})
export const mainfestCreationFailed = (response) => ({
    type: 'MANIFEST_CREATION_FAILED',
    payload: response,
})

/** Asset actions */
export const assetClicked = (asset) => ({type: 'ASSET_CLICKED', payload: asset})
export const clickingAssetDetails = (asset) => ({
    type: 'CLICKING_ASSET_DETAILS',
    payload: asset,
})
export const startingChildAsset = () => ({
    type: 'STARTING_CHILD_ASSET',
})
export const promotingChildAsset = (childBarcode) => ({
    type: 'PROMOTING_CHILD_ASSET',
    childBarcode,
})
export const removingChildAsset = (childBarcode) => ({
    type: 'REMOVING_CHILD_ASSET',
    childBarcode,
})
export const closeAssetChildrenModal = () => ({
    type: 'CLOSE_ASSET_CHILDREN_MODAL',
})
export const closeAssetDetails = () => ({type: 'CLOSE_ASSET_DETAILS'})
export const syncFlaggedAssets = (assets) => ({
    type: 'SYNC_FLAGGED_ASSETS',
    payload: assets,
})
export const clearSelectedAsset = () => ({type: 'CLEAR_SELECTED_ASSET'})

/** Filter & Sort actions */
export const setManifestFilter = (filter) => ({
    type: 'SET_MANIFEST_FILTER',
    payload: filter,
})
export const setManifestSorter = (payload, category) => ({
    type: 'SET_MANIFEST_SORTER',
    payload,
    category,
})
export const setAssetSorter = (payload) => ({
    type: 'SET_ASSET_SORTER',
    payload,
})

/** Forms */
export const closeShipmentDialog = () => ({
    type: 'CLOSE_SHIPMENT_DIALOG',
})
export const openShipmentDialog = () => ({
    type: 'OPEN_SHIPMENT_DIALOG',
})
export const setTrackingNumber = (method, trackingNumber) => ({
    type: 'SET_TRACKING_NUMBER',
    payload: {method, trackingNumber},
})
export const updateDestination = (destination) => ({
    type: 'UPDATE_DESTINATION',
    payload: destination,
})
export const updateTemp = (destination) => ({
    type: 'UPDATE_TEMP',
    payload: destination,
})
export const updateHasBins = (value) => ({
    type: 'UPDATE_HAS_BINS',
    payload: value,
})
export const updateTrackingNumber = (value) => ({
    type: 'UPDATE_TRACKING_NUMBER',
    meta: {
        debounce: 'simple',
    },
    payload: value,
})
export const setFocusTrackingNumber = (value) => ({
    type: 'FOCUS_TRACKING_NUMBER',
    payload: value,
})
export const updateHidden = (value) => ({
    type: 'UPDATE_HIDDEN',
    payload: value,
})
export const glassBreaking = (value) => ({
    type: 'GLASS_BREAKING',
    payload: value,
})
export const breakTheGlass = (value, successFunction) => ({
    type: 'BREAK_THE_GLASS',
    payload: value,
    successFunction,
})
export const breakTheGlassResponse = (response) => ({
    type: 'BREAK_THE_GLASS_RESPONSE',
    payload: response,
})
export const fetchingPasswordValidation = (isFetching) => ({
    type: 'FETCHING_PASSWORD_VALIDATION',
    payload: isFetching,
})

/** Changelog actions */
export const showServerChangelog = () => ({type: 'SHOW_SERVER_CHANGELOG'})
export const hideServerChangelog = () => ({type: 'HIDE_SERVER_CHANGELOG'})

/** Manifest actions */
export const binClosed = (manifest) => ({type: 'BIN_CLOSED', payload: manifest})
export const binPrinted = (manifest) => ({
    type: 'BIN_PRINTED',
    payload: manifest,
})
export const syncFlaggedBins = (bins) => ({
    type: 'SYNC_FLAGGED_BINS',
    payload: bins,
})
export const closePane = () => ({type: 'CLOSE_PANE'})
export const openPane = () => ({type: 'OPEN_PANE'})
export const openPanePreview = (manifest) => ({
    type: 'OPEN_PANE_PREVIEW',
    payload: manifest,
})

/** State transition actions */
export const clearAssetErrors = () => ({type: 'CLEAR_ASSET_ERRORS'})
export const upgradeNeeded = (version) => ({
    type: 'APP_UPGRADE',
    payload: version,
})

/** Window actions */
export const clearLastAssetPaneCoords = () => ({
    type: 'CLEAR_LAST_ASSET_PANE_COORDS',
})
export const setLastAssetPaneCoords = (coords) => ({
    type: 'SET_LAST_ASSET_PANE_COORDS',
    payload: coords,
})
export const setOpenKeys = (openKeys) => ({
    type: 'SET_OPEN_KEYS',
    payload: openKeys,
})
export const setSelectedKeys = (selectedKeys) => ({
    type: 'SET_SELECTED_KEYS',
    payload: selectedKeys,
})
export const clearNotify = () => ({type: 'CLEAR_NOTIFY'})
export const clearToast = () => ({type: 'CLEAR_TOAST'})
export const closeReconcileModal = () => ({type: 'CLOSE_RECONCILE_MODAL'})
export const openReconcileModal = (asset) => ({
    type: 'OPEN_RECONCILE_MODAL',
    payload: asset,
})
export const closePrintModal = () => ({type: 'CLOSE_PRINT_MODAL'})
export const openPrintModal = (manifestId) => ({
    type: 'OPEN_PRINT_MODAL',
    manifestId,
})
export const setTheme = (theme) => ({type: 'SET_THEME', payload: theme})
export const setVolume = (volume) => ({
    type: 'SET_VOLUME',
    payload: volume,
    meta: {
        debounce: 'simple',
    },
})
export const toggleJourney = (payload) => ({type: 'TOGGLE_JOURNEY', payload})
export const toggleLeftSidebar = () => ({type: 'TOGGLE_LEFT_SIDEBAR'})
export const toggleRightSidebar = () => ({type: 'TOGGLE_RIGHT_SIDEBAR'})
export const persistUserSettings = (persist) => ({
    type: 'PERSIST_USER_SETTINGS',
    payload: persist,
})
/** Chat Actions */
export const focusRoom = (room) => ({type: 'FOCUS_ROOM', room})
export const focusPreviousRoom = () => ({type: 'FOCUS_PREV_ROOM'})
export const toggleOpenChat = () => ({type: 'TOGGLE_OPEN_CHAT'})
export const addHistoryMessages = (room, messages) => ({
    type: 'ADD_HISTORY_MESSAGES',
    room,
    messages,
})
export const setStreamPosition = (room, streamPosition) => ({
    type: 'SET_STREAM_POSITION',
    room,
    streamPosition,
})
/**
 * Socket Actions
 */
export const memberJoined = (category, topic, clientInfo) => ({
    type: 'MEMBER_JOINED',
    payload: {
        category,
        topic,
        clientInfo,
    },
})
export const memberLeft = (category, topic, clientInfo) => ({
    type: 'MEMBER_LEFT',
    payload: {
        category,
        topic,
        clientInfo,
    },
})
export const setClientList = (category, topic, clientList) => ({
    type: 'MEMBER_LIST',
    payload: {
        category,
        topic,
        clientList,
    },
})
export const setSocketStatus = (status, context = null) => ({
    type: 'SET_SOCKET_STATUS',
    payload: {status, context},
})
export const setSocketError = (error) => ({
    type: 'SET_SOCKET_ERROR',
    payload: error,
})
export const clearSocketError = () => ({
    type: 'CLEAR_SOCKET_ERROR',
})

/**
 * Drawers
 */
export const setInitialDrawersOffset = (offsets) => ({
    type: 'SET_INITIAL_DRAWERS_OFFSET',
    payload: offsets,
})
export const setMouseOffset = (offset, drawer) => ({
    type: 'SET_MOUSE_OFFSET',
    payload: offset,
    drawer,
})

/**
 * Debounced Actions
 */
export const setDrawerOffsets = (offsets) => ({
    type: 'SET_DRAWER_OFFSETS',
    payload: offsets,
    meta: {
        debounce: 'simple',
    },
})

/**
 * Search actions
 */
// Patient
export const storePatientSearch = (payload) => ({
    type: 'STORE_PATIENT_SEARCH',
    payload,
})
export const fetchingPatientSearch = () => ({type: 'FETCHING_PATIENT_SEARCH'})
export const patientSearchFailed = () => ({
    type: 'PATIENT_SEARCH_FAILED',
})
export const clearPatientSearchError = () => ({
    type: 'CLEAR_PATIENT_SEARCH_ERROR',
})
export const setPatientPage = (size) => ({
    type: 'SET_PATIENT_PAGE',
    payload: size,
})
export const setPatientsPerPage = (size) => ({
    type: 'SET_PATIENTS_PER_PAGE',
    payload: size,
})
// Tabs
export const setSearchTabPosition = (position) => ({
    type: 'SET_SEARCH_TAB_POSITION',
    payload: position,
})
export const setViewingBinResults = (payload) => ({
    type: 'SET_VIEWING_BIN_RESULTS',
    payload,
})
export const setViewingPatientResults = (payload) => ({
    type: 'SET_VIEWING_PATIENT_RESULTS',
    payload,
})
export const setViewingNoResults = () => ({type: 'SET_VIEWING_NO_RESULTS'})
// Bin
export const storeBinSearch = (payload) => ({type: 'STORE_BIN_SEARCH', payload})
export const fetchingBinSearch = () => ({type: 'FETCHING_BIN_SEARCH'})
export const binSearchFailed = () => ({
    type: 'BIN_SEARCH_FAILED',
})
