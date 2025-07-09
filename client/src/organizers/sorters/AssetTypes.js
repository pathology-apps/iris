export default class AssetTypes {
    static Timestamp = {
        name: 'Timestamp',
        details: ['DATE_TS', 'RAW_DISP'],
    }

    static TimestampReverse = {
        name: 'Timestamp (reverse)',
        details: ['DATE_TS_REVERSE', 'RAW_DISP'],
    }

    static PatientName = {
        name: 'Patient Name',
        details: ['RAW_PNAM', 'DATE_TS_REVERSE'],
    }

    static PatientNameReverse = {
        name: 'Patient Name (reverse)',
        details: ['RAW_PNAM_REVERSE', 'DATE_TS_REVERSE'],
    }
}
