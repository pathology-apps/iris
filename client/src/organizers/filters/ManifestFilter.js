export default function ManifestFilter(manifests, filters) {
    let nextManifests = {...manifests}

    if (!filters.length) {
        return nextManifests
    }

    const cleanFilters = {}

    filters.forEach((item) => {
        const splitFilter = item.split(/_(.+)/)
        if (Array.isArray(cleanFilters[splitFilter[0]])) {
            cleanFilters[splitFilter[0]].push(splitFilter[1])
        } else {
            cleanFilters[splitFilter[0]] = [splitFilter[1]]
        }
    })

    Object.keys(nextManifests).forEach((type) => {
        nextManifests = {
            ...nextManifests,
            [type]: nextManifests[type].filter((manifest) =>
                Object.keys(cleanFilters).every((key) =>
                    cleanFilters[key].includes(manifest[key]),
                ),
            ),
        }
    })

    return nextManifests
}
