import StoreRegistry from '@store/registry/index'

export default function ManifestNormalizer(manifests) {
    const store = StoreRegistry.get('store')
    let nextManifests = {...manifests}

    const {stationInfo} = store.getState().acl

    if (!stationInfo) {
        return manifests
    }

    Object.keys(nextManifests).forEach((type) => {
        nextManifests = {
            ...nextManifests,
            [type]: nextManifests[type].filter((manifest) => {
                if (
                    manifest.IS_HIDDEN &&
                    (stationInfo.scc_dept === 'PI' ||
                        stationInfo.scc_dept === 'DQHI')
                ) {
                    return manifest.IBIN === 0
                }
                return manifest.IBIN === 0 && manifest.IS_HIDDEN === 0
            }),
        }
    })
    return nextManifests
}
