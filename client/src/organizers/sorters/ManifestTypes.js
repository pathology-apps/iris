export default class ManifestTypes {
    static AssetCount = {
        name: 'Asset Count',
        details: ['RAW_CNT', 'DATE_CTS_REVERSE'],
    }

    static Origination = {
        name: 'Origination',
        details: ['RAW_FROM', 'DATE_BTS_REVERSE'],
    }

    static Destination = {
        name: 'Destination',
        details: ['RAW_TO', 'DATE_BTS_REVERSE'],
    }

    static Status = {
        name: 'Status',
        details: ['RAW_STS', 'DATE_BTS_REVERSE'],
    }

    static Temperature = {
        name: 'Temperature',
        details: ['RAW_TMP', 'DATE_BTS_REVERSE'],
    }

    static User = {
        name: 'User',
        details: ['RAW_USR', 'DATE_BTS_REVERSE'],
    }

    static Newest = {
        name: 'Newest',
        details: ['FROM', 'DATE_CTS_REVERSE'],
    }

    static Oldest = {
        name: 'Oldest',
        details: ['FROM', 'DATE_CTS'],
    }
}
