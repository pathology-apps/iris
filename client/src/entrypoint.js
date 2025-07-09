import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import setupStore from '@store';

window.onload = function () {
    const app = document.getElementById('app');
    const root = createRoot(app);

    setupStore().then(({ store, persistor }) => {    
        const render = () => {
            const AppComponent = require('./AppComponent').default;
            root.render(
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <AppComponent />
                    </PersistGate>
                </Provider>
            );
        };

        if (process.env.NODE_ENV === 'development' && module.hot) {
            module.hot.accept('./AppComponent', () => {
                render();
            });
        }

        render();
    });
};