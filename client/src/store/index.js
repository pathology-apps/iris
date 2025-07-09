import {configureStore} from '@reduxjs/toolkit'
import createDebounce from 'redux-debounce'
import StoreRegistry from '@store/registry/index'
import pkg from '@client/package.json'
import {setSocketError, setSocketStatus} from '@actions'
import {
    createMigrate,
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/es/storage'
import migrations from '@store/migrations'
import allReducers from '@reducers'
import {Centrifuge} from 'centrifuge'
import serverActions from './serverActions'

const DISCONNECTED = 'disconnected'
const CONNECTING = 'connecting'
const CONNECTED = 'connected'

export default async function setupStore() {
    const persistConfig = {
        version: pkg.migration,
        key: 'root',
        blacklist: [
            'comments',
            'forms',
            'home',
            'manifests',
            'messages',
            'printing',
            'time',
            'versioning',
        ],
        storage,
        migrate: createMigrate(migrations, {debug: false}),
    }

    const persistedReducer = persistReducer(persistConfig, allReducers)
    const debouncer = createDebounce({simple: 10})

    const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        FLUSH,
                        REHYDRATE,
                        PAUSE,
                        PERSIST,
                        PURGE,
                        REGISTER,
                    ],
                },
            }).concat(debouncer),
        devTools: {
            actionsDenylist: ['SET_DRAWER_OFFSETS'],
        },
    })

    const persistor = persistStore(store)
    const socket = new Centrifuge(
        `wss://${window.location.host}/connection/websocket`,
        {
            getToken: async () => store.getState().acl.accessToken,
        },
    )

    socket.on('message', (msg) => {
        serverActions(msg.data[1])
    })

    window.addEventListener('online', () => {
        socket.connect()
    })

    window.addEventListener('offline', () => {
        socket.disconnect()
    })

    socket.on('disconnected', () => {
        store.dispatch(setSocketStatus(DISCONNECTED))
    })

    socket.on('connecting', (ctx) => {
        store.dispatch(setSocketStatus(CONNECTING, ctx))
    })

    socket.on('connected', (ctx) => {
        store.dispatch(setSocketStatus(CONNECTED, ctx))
    })

    socket.on('error', (err) => {
        if (typeof err === 'string') {
            store.dispatch(setSocketError(err))
        }
    })

    StoreRegistry.register('store', store)
    StoreRegistry.register('socket', socket)

    return {persistor, store, socket}
}
