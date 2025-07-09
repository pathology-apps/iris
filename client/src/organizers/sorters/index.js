import Comparator from './Comparator'

export default class Sorter {
    /**
     * Takes state and sorts the manifests list using a static sorter array:
     * @param {*} state
     * @param {*} sorter
     */
    static manifests(manifests, sorters) {
        const nextManifests = {...manifests}

        Object.keys(nextManifests).forEach((type) => ({
            ...nextManifests,
            [type]: nextManifests[type].sort((a, b) =>
                new Comparator(sorters[type].details, a, b).evaluate(),
            ),
        }))
        return nextManifests
    }

    static assets(assets, sorter) {
        const nextAssets = assets.slice()

        return nextAssets.sort((a, b) =>
            new Comparator(sorter.details, a, b).evaluate(),
        )
    }
}
