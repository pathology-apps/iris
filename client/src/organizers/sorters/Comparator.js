export default class Comparator {
    constructor(sorters, a, b) {
        this.a = a
        this.b = b
        this.sorters = sorters
        this.value = 0
        this.currentSorter = null
    }

    decay = (idx) => {
        const reversal = this.sorters.slice().reverse()
        let weight

        reversal.find((item, index) => {
            weight = this.sorters[idx] === item && index + 1 + index * 2
            return this.sorters[idx] === item
        })
        return weight
    }

    setValue = (idx, value) => {
        value *= this.decay(idx, value)
        this.value += value
    }

    evaluate() {
        /** Establish a primary sort field by taking the first
         * static sorter provided and giving it a boost of +1000
         * value.
         */
        this.sorters.forEach((sorter, idx) => {
            this.currentSorter = sorter
            if (sorter.startsWith('RAW_')) {
                const field = sorter.replace('RAW_', '').replace('_REVERSE', '')
                if (sorter.endsWith('_REVERSE')) {
                    if (this.a[field] < this.b[field]) {
                        this.setValue(idx, 1)
                    }
                    if (this.a[field] > this.b[field]) {
                        this.setValue(idx, -1)
                    }
                } else {
                    if (this.a[field] < this.b[field]) {
                        this.setValue(idx, -1)
                    }
                    if (this.a[field] > this.b[field]) {
                        this.setValue(idx, 1)
                    }
                }
            } else if (sorter.startsWith('DATE_')) {
                const field = sorter
                    .replace('DATE_', '')
                    .replace('_REVERSE', '')
                const dateA = new Date(this.a[field])
                const dateB = new Date(this.b[field])
                if (sorter.endsWith('_REVERSE')) {
                    if (dateA < dateB) {
                        this.setValue(idx, 1)
                    }
                    if (dateA > dateB) {
                        this.setValue(idx, -1)
                    }
                } else {
                    if (dateA < dateB) {
                        this.setValue(idx, -1)
                    }
                    if (dateA > dateB) {
                        this.setValue(idx, 1)
                    }
                }
            }
        })
        return this.value
    }
}
