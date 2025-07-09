import React from 'react'
import {LoadingOutlined} from '@ant-design/icons'
import {message} from 'antd'
import randomColor from 'randomcolor'
import UAParser from 'ua-parser-js'
import PropTypes from 'prop-types'
import {isEmpty, tokenIsValid} from '@libs/global'
import StoreRegistry from '@store/registry/index'

export const blacklist = ['Edge', 'IE']
export const errorColor = '#BA2222'
export const serverNames = {
    local: 'Local',
    dev: 'Dev',
    test: 'Test',
    qa: 'QA',
    prod: 'Production',
}
export const statusNames = {
    is_open: 'Opened',
    is_inuse: 'Loading',
    is_closed: 'Closed',
    is_packaged: 'Awaiting Pickup',
    courrier_pickup: 'In Transit',
    is_arrived: 'Arrived',
    is_received: 'Received',
    is_unloading: 'Unloading',
    is_complete: 'Reconciled',
}

export function Loading({pad, color, note}) {
    const style = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2em',
        padding: pad ? null : '1em',
    }
    const iconStyle = {
        color: color || '#000',
    }
    return (
        <div style={style}>
            <LoadingOutlined style={iconStyle} spin />
            <small style={{fontSize: '0.5em', marginTop: '1em'}}>
                {note || null}
            </small>
        </div>
    )
}
Loading.propTypes = {
    pad: PropTypes.bool,
    color: PropTypes.string,
    note: PropTypes.string,
}

export const locationTitle = (shortcode) => {
    const {
        raw,
        acl: {stationInfo},
    } = StoreRegistry.get('store').getState()
    let name = 'No location assigned'
    if (shortcode) {
        const loc = raw.locations.find((l) => l.shortcode === shortcode)
        if (loc?.name) {
            name = loc.name
        }
        return `${shortcode} - ${name?.toUpperCase()}`
    }

    return `${stationInfo.shortcode} - ${stationInfo.name?.toUpperCase()}`
}

export const handleDestinationFilter = (input, options) => {
    let success = false
    if (options.children) {
        if (
            typeof options.children === 'string' &&
            options.children.toLowerCase().includes(input.toLowerCase())
        ) {
            success = true
        }
    }
    return success
}

export const handleLocationFilter = (input, options) => {
    let success = false
    if (options.children) {
        success = options.children.some((part) => {
            if (
                typeof part === 'string' &&
                part
                    .toLowerCase()
                    .split(' ')
                    .join('')
                    .includes(input.toLowerCase().split(' ').join(''))
            ) {
                return true
            }
            return false
        })
    }
    return success
}

export const padLeft = (strToPad, amountToPad, asciiForPadding = '0') =>
    (strToPad < 0 ? '-' : '') +
    Array(amountToPad - String(Math.abs(strToPad)).length + 1).join(
        asciiForPadding,
    ) +
    Math.abs(strToPad)

export const formatOracleMsg = (msg, idx = null) => {
    const hasNewline = msg.includes('[BR]')
    if (!hasNewline) {
        return decodeURIComponent(msg)
    }
    return msg.split(/\[BR\]/g).map((item, key) => (
        <span key={`${idx || key + 1}`}>
            {decodeURIComponent(item)}
            <br />
        </span>
    ))
}

export const ucwords = (str) =>
    `${str}`.replace(/^(.)|\s+(.)/g, ($1) => $1.toUpperCase())

export const status = (manifest) => manifest.STS.toLowerCase()

export const friendlyStatus = (manifest) => statusNames[status(manifest)]

export const isInLab = (asset) => asset.ILB === 'YES'

export const stripEndComma = (str) =>
    str.endsWith(', ') ? str.replace(', ', '') : str

export const requiresAttention = (asset) => {
    // Function is disabled until we iron out edge cases.
    return false
    // eslint-disable-next-line no-unreachable
    return (
        (asset.ILG === 'NO' && asset.ICAN === 'YES' && asset.CAN === 'NO') ||
        (asset.IREC === 'YES' && asset.ILG === 'NO')
    )
}

export const isComplete = (manifest) =>
    friendlyStatus(manifest) === 'Reconciled'

export const isErrored = (item) => item.ERR

export const manifestIsNew = (manifest) => {
    const {acl} = StoreRegistry.get('store').getState()
    let isNew = false
    const dt = new Date(manifest.CTS)
    dt.setMinutes(dt.getMinutes() + 2)

    if (new Date() < dt && manifest.USR === acl.details.uniquename) {
        isNew = true
    }

    return isNew
}

export const renderRouteString = (manifest) => {
    function renderIcon() {
        let icon = <i className="icon-right" style={{margin: '0 9px'}} />

        if (isErrored(manifest)) {
            icon = <i className="icon-block" style={{margin: '0 9px'}} />
        } else if (isComplete(manifest)) {
            icon = <i className="icon-ok" style={{margin: '0 9px'}} />
        }

        return icon
    }

    return (
        <>
            {manifest.FROM}
            {renderIcon(manifest)}
            {manifest.TO}
        </>
    )
}

export const fullTemp = (manifest) => {
    let temp

    switch (manifest.TMP) {
        case 'A':
            temp = 'Ambient'
            break
        case 'F':
            temp = 'Frozen'
            break
        case 'R':
            temp = 'Refrigerated'
            break
        default:
            break
    }

    return temp
}

export const resolve = (response, error, resolver) => {
    let httpCode
    let httpDesc

    if (response.status !== 200) {
        httpCode = response.status
        httpDesc = response.statusText
    } else if (response.data.error) {
        httpCode = 'Authorization Error'
        httpDesc = response.data.message
    } else {
        return true
    }

    setTimeout(() => {
        StoreRegistry.get('store').dispatch(resolver())
    }, 4000)

    return StoreRegistry.get('store').dispatch(error({httpCode, httpDesc}))
}

export const trimObj = (obj) => {
    Object.keys(obj).map((k) => {
        const trimmedObject =
            typeof obj[k] === 'string' ? (obj[k] = obj[k].trim()) : obj[k]
        return trimmedObject
    })
    return obj
}

export const formatPatientSearch = (newSearch = false, vals = null) => {
    let row_start

    const {form, search} = StoreRegistry.get('store').getState()
    const {patient} = search
    const values = vals !== null ? vals : form.patient.values
    const {pageSize} = patient
    let {page} = patient

    if (newSearch) {
        page = 1
    }

    const row_end = page * pageSize

    if (page === 1) {
        row_start = 1
    } else {
        row_start = (page - 1) * pageSize + 1
    }

    const data = {
        start_date: values.rangePicker
            ? ''
            : null,
        end_date: values.rangePicker ? '' : null,
        row_start,
        row_end,
        ...vals,
    }
    delete data.rangePicker
    return trimObj(data)
}

export const formatAccessionNumber = (userTypedAccession) => {
    const validateAccession =
        /["\s]?([a-zA-Z]\s?[a-zA-Z])[\s?\-?\s?]?(\d+)[\s?\-?\s?]?(\d+)([^\r\n]*)/g
    const matches = validateAccession.exec(userTypedAccession)
    if (!matches || matches.length <= 3) {
        return userTypedAccession
    }
    const sequence = parseInt(matches[3], 10)
    const paddedSequence = padLeft(sequence, 7)
    const matchedAccession = matches[1] + matches[2] + paddedSequence
    return matchedAccession
}

export const formatBinSearch = ({rangePicker, placer_group_nbr, ...rest}) =>
    trimObj({
        start_date: '',
        end_date: '',
        placer_group_nbr: formatAccessionNumber(placer_group_nbr),
        ...rest,
    })

export const responseToChildren = (msg) => {
    let child = msg
    if (typeof msg === 'object') {
        child = Object.keys(msg).map((m) => (
            <>
                <span>{msg[m]}</span>
                <br />
            </>
        ))
    }

    if (child.indexOf('\n') !== -1) {
        const splitMsg = child.split('\n').slice(0, 5)
        child = (
            <ul className="pt-fatal-error">
                {splitMsg.map(
                    (item) => item !== '' && <li key={item}>{item}</li>,
                )}
            </ul>
        )
    }

    return child
}

export const temp = (manifest) => {
    const tmp = manifest.TMP
    return tmp.toLowerCase()
}

export const temps = {
    A: 'Ambient',
    R: 'Refrigerated',
    F: 'Frozen',
}

export const icon = (manifest) => {
    let manifestIcon
    switch (temp(manifest)) {
        case 'a':
            manifestIcon = 'icon-sun'
            break
        case 'r':
            manifestIcon = 'icon-waves'
            break
        case 'f':
            manifestIcon = 'icon-snowflake-o'
            break
        default:
            break
    }
    return manifestIcon
}

export const iconNode = (manifest) => <i className={icon(manifest)} />

export const browser = () => new UAParser().getResult().browser

export const getBrowserDetails = () => {
    const parser = new UAParser()
    const result = parser.getResult()
    const {name, version} = result.browser
    const {ua} = result

    return {
        name,
        version,
        ua,
    }
}

export const browserBlacklisted = () => blacklist.indexOf(browser().name) !== -1

export const browserWhitelisted = () => blacklist.indexOf(browser().name) === -1

export const userColor = (user) =>
    randomColor({
        luminosity: 'dark',
        seed: user,
    })

export const tokenMinsRemaining = () => {
    const {acl} = StoreRegistry.get('store').getState()
    const expiry = new Date(acl.details.exp * 1000)

    const diff = expiry - new Date()

    return Math.floor(diff / 1000 / 60)
}

export const tokenSecsRemaining = () => {
    const {acl} = StoreRegistry.get('store').getState()
    const expiry = new Date(acl.details.exp * 1000)

    const diff = expiry - new Date()

    return Math.floor(diff / 1000)
}

export function refreshToken(forced = false) {
    const {acl} = StoreRegistry.get('store').getState()
    if (!isEmpty(acl.details)) {
        const lastRefresh = new Date(acl.tokenLastRefreshed)

        const isValid = tokenIsValid(acl)
        const minRemaining = tokenMinsRemaining()
        const secRemaining = tokenSecsRemaining()
        const tokenLastRefreshed = acl.tokenLastRefreshed
            ? Math.floor((new Date() - lastRefresh) / 1000)
            : null

        // Debug data for tokens, uncomment if needed:
        // console.info({acl})
        // console.info({tokenLastRefreshed})
        // console.info({isValid})
        // console.info({minRemaining})
        // console.info({secRemaining})

        // if (!tokenLastRefreshed) {
        //     console.info('Token has never been refresh!')
        // } else {
        //     console.info(`Token was refreshed ${tokenLastRefreshed} seconds ago`)
        // }

        // if (forced) {
        //     return StoreRegistry.get('store').dispatch(doTokenRefresh())
        // }

        // if (
        //     isValid &&
        //     minRemaining < 20 &&
        //     secRemaining >= 10 &&
        //     acl.tokenStatus !== 'FETCHING' &&
        //     (acl.tokenLastRefreshed === null || tokenLastRefreshed >= 30)
        // ) {
        //     return StoreRegistry.get('store').dispatch(doTokenRefresh())
        // }
        return false
    }
    return false
}

export const toClipboard = async (el, context) => {
    if (!el) return

    try {
        const text = el.textContent || el.innerText
        await navigator.clipboard.writeText(text)
        message.success(`${context} copied to your clipboard.`)
    } catch (error) {
        console.error('Error copying to clipboard: ', error)
    }
}

export const countAllChildren = (assets) =>
    assets.reduce((acc, obj) => {
        if (!obj.child_assets) {
            return acc
        }
        return acc + obj.child_assets.length
    }, 0)

export const childReconciledVsTotal = (asset) => {
    if (!asset.CCNT) {
        return {
            reconciled: 0,
            total: 0,
        }
    }
    const counts = asset.CCNT.split('/')
    return {
        reconciled: parseInt(counts[0], 10),
        total: parseInt(counts[1], 10),
    }
}

export const isActionableBin = (manifest) =>
    ['IS_OPEN', 'IS_INUSE'].includes(manifest.STS)

export const hasChildren = (asset) => {
    if (!asset.CCNT) {
        return false
    }
    const counts = childReconciledVsTotal(asset)
    return counts.total > 0
}

export const hasAllReconciledChildLabels = (asset) => {
    if (!asset.CCNT) {
        return false
    }
    const counts = childReconciledVsTotal(asset)
    return counts.reconciled === counts.total
}

export const hasPartialReconciledChildLabels = (asset) => {
    if (!asset.CCNT) {
        return false
    }
    const counts = childReconciledVsTotal(asset)
    return asset.ILG === 'YES' && counts.reconciled < counts.total
}

export const assetById = (id) => {
    const {assets} = StoreRegistry.get('store').getState().bin
    const asset = assets.find((item) => item.ABC === id)
    if (!isEmpty(asset)) {
        return asset
    }
    return {}
}

export const getLocationShortcode = (selectedValue) =>
    selectedValue.split(' - ')[0]

export const locAsString = (station) => `${station.shortcode} - ${station.name}`

export const isQADepartment = () => {
    const allowedDepartments = ['DQHI', 'PI']
    const {scc_dept} = StoreRegistry.get('store').getState().acl.stationInfo
    return allowedDepartments.includes(scc_dept)
}

export const parseAndExplodeLocation = (location) => {
    const data = location.split('-')
    return {
        shortcode: data[0].trim(),
        name: data[1].trim(),
    }
}

export const capitalize = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1)

export const renameProperty = (obj, oldName, newName) => {
    // Do nothing if the names are the same
    if (oldName === newName) {
        return obj
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (Object.prototype.hasOwnProperty.call(obj, oldName)) {
        obj[newName] = obj[oldName]
        delete obj[oldName]
    }
    return obj
}

export const friendlyBarcode = (manifest) => {
    const parts = manifest.BC.split(manifest.FROM)

    return {
        date: '',
        bin: parseInt(parts[1], 10),
    }
}
