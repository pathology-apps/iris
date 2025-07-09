import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import DemoViewer from './views/DemoViewer';

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <DemoViewer />,
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;