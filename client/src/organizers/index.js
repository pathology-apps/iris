import Sorter from './sorters'
import ManifestFilter from './filters/ManifestFilter'

export default class Organizer {
    static manifests(manifests, filter = [], sorters) {
        /**
         * The ManifestSorter() takes state and a sorter constant, similar
         * to the ManifestFilter() which takes state and a filter constant.
         *
         * ManifestFilter() defaults to 'ALL_MANIFESTS'
         * ManifestSorter() defaults to 'ORACLE'
         */
        const nonHeaderFilters = filter.filter((f) => !f.startsWith('HEADING_'))
        return Sorter.manifests(
            ManifestFilter(manifests, nonHeaderFilters),
            sorters,
        )
    }

    static assets(assets, sorter) {
        return Sorter.assets(assets, sorter)
    }
}
