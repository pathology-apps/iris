class StoreRegistry {
    register(type, value) {
        this[type] = value
    }

    get(type) {
        return this[type]
    }

    purge(type) {
        delete this[type]
    }
}

export default new StoreRegistry()
