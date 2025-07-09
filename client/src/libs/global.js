export function isEmpty(obj) {
    if (!obj) {
        return true
    }
    return Object.entries(obj).length === 0 && obj.constructor === Object
}

export function detectShippingCompany(trackingNumber) {
    const reUPS = /\b1Z[A-Z0-9]{16}\b/
    const reFedEx = /\b([0-9]{12}|100\d{31}|\d{15}|\d{18}|96\d{20}|96\d{32})\b/
    if (reUPS.exec(trackingNumber) !== null) {
        return 'UPS'
    }
    if (reFedEx.exec(trackingNumber) !== null) {
        return 'FedEx'
    }
    return false
}

export function trackingLink(carrier, trackingNumber) {
    switch (carrier) {
        case 'FedEx':
            return `https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber=${trackingNumber}`
        case 'UPS':
            return `http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${trackingNumber}`
        default:
            break
    }
    return ''
}

export function shippingInformation(trackingNumber) {
    const carrier = detectShippingCompany(trackingNumber)
    return carrier
        ? {
              number: trackingNumber,
              carrier,
              link: trackingLink(carrier, trackingNumber),
          }
        : false
}

export const humanFileSize = (bytes, si) => {
    const thresh = si ? 1000 : 1024
    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    let u = -1
    do {
        bytes /= thresh
        u += 1
    } while (Math.abs(bytes) >= thresh && u < units.length - 1)
    return `${bytes.toFixed(1)} ${units[u]}`
}

export const setConfigData = (type, payload) => {
    const myLocations = {}

    const uniqueBuilding = [
        ...new Set(payload[type].map((location) => location.building)),
    ]
    uniqueBuilding.forEach((building) => {
        myLocations[building] = payload[type].filter(
            (location) => location.building === building,
        )
    })
    return myLocations
}

export const tokenIsValid = (acl) => {
    if (isEmpty(acl) || isEmpty(acl.details)) {
        return false
    }

    if (new Date() > new Date(acl.details.exp * 1000)) {
        return false
    }

    return true
}

export const isSocketRoute = (location = window.location) =>
    location.pathname.includes('/auth') && !location.pathname.includes('/print')

export class FloatingStackWindow {
    constructor(limit = 10) {
        this.limit = limit
        this.stack = {}
    }

    push = (pid, data) => {
        if (!this.stack[pid]) {
            this.stack[pid] = []
        }
        if (this.stack[pid] && this.stack[pid].length >= this.limit) {
            this.stack[pid].shift()
        }
        this.stack[pid].push(data)
    }

    view = () => this.stack
}
