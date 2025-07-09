const search = {
    bin: {
        fetching: false,
    },
    patient: {
        results: [],
        count: null,
        fetching: false,
        page: 1,
        pageSize: 10,
    },
    tabPosition: 'bin',
    viewingBinResults: false,
    viewingPatientResults: false,
}

export default (state = search, action) => {
    switch (action.type) {
        case 'SET_VIEWING_NO_RESULTS':
            return {
                ...state,
                viewingBinResults: false,
                viewingPatientResults: false,
            }
        case 'SET_VIEWING_PATIENT_RESULTS':
            return {
                ...state,
                viewingBinResults: !action.payload,
                viewingPatientResults: action.payload,
            }
        case 'SET_VIEWING_BIN_RESULTS':
            return {
                ...state,
                viewingBinResults: action.payload,
                viewingPatientResults: !action.payload,
            }
        case 'SET_SEARCH_TAB_POSITION':
            return {
                ...state,
                tabPosition: action.payload,
                viewingBinResults: false,
                viewingPatientResults: false,
            }
        case 'SET_PATIENT_PAGE':
            return {
                ...state,
                patient: {
                    ...state.patient,
                    page: action.payload.page,
                    pageSize: action.payload.pageSize,
                },
            }
        case 'SET_PATIENTS_PER_PAGE':
            return {
                ...state,
                patient: {
                    ...state.patient,
                    page: action.payload.current,
                    pageSize: action.payload.size,
                },
            }
        case 'STORE_BIN_SEARCH':
            return {
                ...state,
                bin: {
                    ...state.bin,
                    fetching: false,
                },
            }
        case 'STORE_PATIENT_SEARCH':
            return {
                ...state,
                patient: {
                    ...state.patient,
                    results: action.payload.patients,
                    count: action.payload.rec_cnt,
                    fetching: false,
                    page: 1,
                },
            }
        case 'FETCHING_BIN_SEARCH':
            return {
                ...state,
                bin: {
                    ...state.bin,
                    fetching: true,
                },
            }
        case 'FETCHING_PATIENT_SEARCH':
            return {
                ...state,
                patient: {
                    ...state.patient,
                    fetching: true,
                },
            }
        case 'PATIENT_SEARCH_FAILED':
            return {
                ...state,
                patient: {
                    ...state.patient,
                    fetching: false,
                },
            }
        case 'BIN_SEARCH_FAILED':
            return {
                ...state,
                bin: {
                    ...state.bin,
                    fetching: false,
                },
            }
        case '@@redux-form/RESET':
            return {
                ...state,
                [action.meta.form]: search[action.meta.form],
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return search
        default:
            return state
    }
}
