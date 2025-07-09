import ManifestTypes from '@organizers/sorters/ManifestTypes'

const migrations = {
    0: (state) => ({
        ...state,
        template: {
            ...state.template,
            manifestSorter: {
                ...state.template.manifestSorter,
                search: ManifestTypes.Department,
            },
        },
    }),
    1: (state) =>
        // Migration #1: Setting all Department keys in the template.manifestSorter key to Destination.',
        ({
            ...state,
            template: {
                ...state.template,
                manifestSorter: {
                    expected: ManifestTypes.Destination,
                    current: ManifestTypes.Destination,
                    sent: ManifestTypes.Destination,
                    search: ManifestTypes.Destination,
                },
            },
        }),
    2: (state) =>
        // Migration #2: Increment migration
        state,
    3: (state) =>
        // Migration #3: Clearing the old filter types.
        ({
            ...state,
            template: {
                ...state.template,
                manifestFilter: [],
            },
        }),
    4: (state) =>
        // Migration #4: Reset drawer positions
        ({
            ...state,
            drawer: {},
        }),
    5: (state) =>
        // Migration #5: Add shipment method
        ({
            ...state,
            shipmentMethod: {
                visible: false,
            },
        }),
}

export default migrations
