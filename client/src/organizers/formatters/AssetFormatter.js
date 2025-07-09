import {renameProperty, ucwords} from '@libs'

/**
 * AssetFormatter format Asset details by
 * segregate patient fields, order fields and specimen fields
 */

export default class AssetFormatter {
    segregateAsssetDetails = (details) => {
        const detailsStruct = {
            Patient: {
                Name: '',
                'Date of Birth': '',
                'MRN SCC': '',
                'MRN MiChart': '',
                'EMPI ID': '',
                Sex: '',
                'Patient Class': '',
            },
            Order: {
                'Lab / MiChart Order': '',
                'Billing / Visit': '',
                'Dx / Gene Order': '',
                'AP Service': '',
                Clinic: '',
                Tests: '',
            },
            Asset: {
                'Material ID': '',
                Barcode: '',
                Class: '',
                Type: '',
                'Cap. (Capacity)': '',
                Description: '',
                Modifier: '',
                'Collection Date': '',
                'Collection Priority': '',
                'Collection By': '',
            },
            Other: {},
        }
        const detailKeys = Object.keys(this.replaceBRwithNewLine(details))
        detailKeys.forEach((k) => {
            if (
                Object.prototype.hasOwnProperty.call(detailsStruct.Patient, k)
            ) {
                detailsStruct.Patient[k] = details[k].toString()
            } else if (
                Object.prototype.hasOwnProperty.call(detailsStruct.Order, k)
            ) {
                detailsStruct.Order[k] = details[k].toString()
            } else if (
                Object.prototype.hasOwnProperty.call(detailsStruct.Asset, k)
            ) {
                detailsStruct.Asset[k] = details[k].toString()
            } else if (!['Child Assets', 'Note'].includes(k)) {
                detailsStruct.Other[k] = details[k].toString()
            }
        })
        return detailsStruct
    }

    formatDxGeneOrder = (formattedAssetDetails) => {
        const strDxgeneOrder = formattedAssetDetails['Dx / Gene Order']
        if (strDxgeneOrder) {
            const firstchars = strDxgeneOrder.substring(0, 2)
            const yearChars = strDxgeneOrder.substring(2, 4)
            const sequenceInt = parseInt(
                strDxgeneOrder.substring(4, strDxgeneOrder.length),
                10,
            )
            formattedAssetDetails['Dx / Gene Order'] =
                `${firstchars}-${yearChars}-${sequenceInt}`
        }
        return formattedAssetDetails
    }

    prepareRawData = (assetDetails) => {
        let formattedAssetDetails = {...assetDetails}

        Object.keys(assetDetails).map((k) =>
            renameProperty(
                formattedAssetDetails,
                k,
                this.constructor.mapping(k),
            ),
        )
        if (Object.keys(formattedAssetDetails).length > 0) {
            formattedAssetDetails = this.formatDxGeneOrder(
                formattedAssetDetails,
            )
        }

        return this.segregateAsssetDetails(formattedAssetDetails)
    }

    replaceBRwithNewLine = (obj) => {
        const deLimiter = '[BR]'
        const objKeys = Object.keys(obj)
        objKeys.forEach((k) => {
            if (obj[k].includes(deLimiter)) {
                obj[k] = this.replaceAllStrings(obj[k], '\r\n')
            }
        })
        return obj
    }

    replaceAllStrings = (str, replaceString) =>
        str.replace(/\[[BR][^\]]*]/, replaceString)

    static mapping(key) {
        const myKey = ucwords(key.replace(/_/g, ' ').toLowerCase())
        switch (myKey) {
            case 'Empi Id':
                return 'EMPI ID'

            case 'Pt Name':
                return 'Name'

            case 'Soft Mrn':
                return 'MRN SCC'

            case 'Uniquename':
                return 'Scanned by'

            case 'Uofm Mrn':
                return 'MRN MiChart'

            case 'Dob':
                return 'Date of Birth'

            case 'Soft Visit':
                return 'Billing / Visit'

            case 'Soft Pat Class':
                return 'Patient Class'

            case 'Placer Group Nbr Lab':
                return 'Lab / MiChart Order'

            case 'Placer Group Nbr Dxp':
                return 'Dx / Gene Order'

            case 'Soft Collection Priority':
                return 'Collection Priority'

            case 'Collection Datetime':
                return 'Collection Date'

            case 'Gp Spe Samtpdesc':
                return 'Description'

            case 'Gp Ord Apservice':
                return 'AP Service'

            case 'Asset Name':
                return 'Material ID'

            case 'Visit Location':
                return 'Clinic'

            case 'Tmod':
                return 'Modifier'

            case 'Asset Class':
                return 'Class'

            case 'Asset Type':
                return 'Type'

            case 'Asset Barcode':
                return 'Barcode'

            case 'Cap':
                return 'Cap. (Capacity)'

            default:
                return myKey
        }
    }
}
