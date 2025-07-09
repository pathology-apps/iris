import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { createRoot } from 'react-dom/client';
import AppComponent from './AppComponent';

window.onload = function () {
    const app = document.getElementById('app');
    const root = createRoot(app);

    const render = () => {
        root.render(<AppComponent />);
    };

    if (process.env.NODE_ENV === 'development' && module.hot) {
        module.hot.accept('./AppComponent', () => {
            render();
        });
    }

    render();
};