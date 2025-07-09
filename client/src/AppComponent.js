import React, { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { notification, message } from 'antd';
import axios from 'axios';
import AllCollections from './views/AllCollections';
import CollectionDetails from './views/CollectionDetails';
import ImageViewer from './views/ImageViewer';
import RandomSet from './views/Randomset';
import Tools from './views/Tools';
import ManageCollections from './views/ManageCollections';
import Suggestions from './views/Suggestions';
import StudySets from './views/StudySets';
import StudySetDetail from './views/StudySetDetail';
import LoginTemplate from './views/LoginTemplate';
import ManageStudySets from './views/ManageStudySets';
import ManageUserPermissions from './views/ManageUserPermissions';
import EditSlides from './views/EditSlides';
import LandingPage from './views/LandingPage';
import DemoViewer from './views/DemoViewer';

function isAuthenticated() {
    const cookieArray = document.cookie.split('; ');
    const token = cookieArray.find(row => row.startsWith('session_token='))?.split('=')[1];
    return !!token;
}

export const fetchUserPermissions = async () => {
    try {
        const username = sessionStorage.getItem('username') || '';
        const response = await axios.get(`/api/users/permissions/${username}`);
        return response.data;
    } catch (error) {
        message.error("Failed to fetch user permissions");
        return [];
    }
};

function AuthenticatedRoute({ element }) {
    return isAuthenticated() ? element : <Navigate to="/login" replace />;
}

function AuthorizedRoute({ element, requiredPermission }) {
    const [userPermissions, setUserPermissions] = useState([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);
    const isLoggedIn = isAuthenticated();
    const isAuthorized =
        requiredPermission === 'tools'
            ? userPermissions
            : userPermissions.includes(requiredPermission);
    const hasToolsPerm = ['collections', 'studysets', 'admin'].some(permission =>
        userPermissions.includes(permission)
    );

    useEffect(() => {
        const loadPermissions = async () => {
            const permissions = await fetchUserPermissions() || [];
            setUserPermissions(permissions);
            setPermissionsLoaded(true);
        };

        if (isLoggedIn) {
            loadPermissions();
        } else {
            setPermissionsLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (permissionsLoaded && !isAuthorized && isLoggedIn) {
            const pageName = element?.type?.name || 'this page';
            notification.error({
                message: 'Access Denied',
                description: `You do not have permission to view ${pageName}.`,
            });
        }
    }, [permissionsLoaded, isAuthorized, isLoggedIn, element]);

    if (!permissionsLoaded) {
        return null;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthorized) {
        if (requiredPermission === 'tools') {
            return <Navigate to="/" replace />;
        }
        if (!hasToolsPerm && requiredPermission !== 'tools') {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/tools" replace />;
    }

    return element;
}

function NotFound() {
    return <h1 style={{ textAlign: 'center', marginTop: '20px' }}>404 - Page Not Found</h1>;
}

function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const fullname = sessionStorage.getItem('fullname')?.replace(/,([^ ])/g, ', $1') || '';
    const [userPermissions, setUserPermissions] = useState([]);
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated());
  
    useEffect(() => {
        const loadPermissions = async () => {
            const permissions = await fetchUserPermissions();
            setUserPermissions(permissions);
        };

        if (isAuthenticatedState) {
            loadPermissions();
        } else {
            setUserPermissions([]);
        }
    }, [isAuthenticatedState]);

    const handleLogout = () => {
        document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('fullname');
        setIsAuthenticatedState(false);
        navigate('/login');
    };

    const headerHeight = '60px';

    return (
        <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', minHeight: '90vh', backgroundColor: '#fff', margin: '0', padding: '0' }}>
            <header style={{
                backgroundColor: '#00274C',
                color: '#fff',
                width: '100%',
                height: headerHeight,
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                zIndex: '1000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                boxSizing: 'border-box',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ fontSize: '1.5em', margin: '0' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Virtual Slide Box</Link>
                    </h1>
                    <nav style={{ display: 'flex', gap: '20px', marginLeft: '10px' }}>
                        <Link
                            to="/"
                            style={linkStyle}
                            onMouseEnter={(e) => e.target.style.color = '#ffdc00'}
                            onMouseLeave={(e) => e.target.style.color = '#007bff'}
                        >
                            Collections
                        </Link>
                        <Link
                            to="/tools"
                            style={linkStyle}
                            onMouseEnter={(e) => e.target.style.color = '#ffdc00'}
                            onMouseLeave={(e) => e.target.style.color = '#007bff'}
                        >
                            Tools
                        </Link>
                        <Link
                            to="/suggestions"
                            style={linkStyle}
                            onMouseEnter={(e) => e.target.style.color = '#ffdc00'}
                            onMouseLeave={(e) => e.target.style.color = '#007bff'}
                        >
                            Suggestions
                        </Link>
                    </nav>
                </div>
                {location.pathname !== '/login' && (
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '1em',
                            transition: 'color 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#ffdc00'}
                        onMouseLeave={(e) => e.target.style.color = '#fff'}
                    >
                        {fullname} - Logout
                    </button>
                )}
            </header>
            <main style={{ margin: '0 auto', marginTop: '20px', padding: '20px', paddingTop: headerHeight, backgroundColor: '#fff', borderRadius: '8px' }}>
                <Outlet />
            </main>
        </div>
    );
}

const linkStyle = {
    textDecoration: 'none',
    color: '#007bff',
    transition: 'color 0.3s',
};

const handleMouseOver = (e) => {
    e.target.style.color = '#0056b3';
};

const handleMouseOut = (e) => {
    e.target.style.color = '#007bff';
};

const linkHoverStyle = {
    color: '#0056b3',
};

function Dashboard() {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2em', marginBottom: '30px' }}>Slide Collections</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '30px' }}>
                <li>
                    <Link
                        to="/collections"
                        style={{ ...linkStyle, padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px' }}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        Collections
                    </Link>
                </li>
                <li>
                    <Link
                        to="/study-sets"
                        style={{ ...linkStyle, padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px' }}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        Study Sets
                    </Link>
                </li>
            </ul>
        </div>
    );
}

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <MainLayout />,
            children: [
                { path: '/', element: <AuthenticatedRoute element={<Dashboard />} /> },
                { path: 'dashboard', element: <AuthenticatedRoute element={<Dashboard />} /> },
                { path: 'collections', element: <AuthenticatedRoute element={<AllCollections />} /> },
                { path: 'study-sets', element: <AuthenticatedRoute element={<StudySets/>} /> },
                { path: '/studysets/:id', element: <AuthenticatedRoute element={<StudySetDetail />} /> },
                { path: '/login', element: <LoginTemplate /> },
                { path: 'tools', element: <AuthorizedRoute element={<Tools />} requiredPermission="tools" /> },
                { path: 'suggestions', element: <AuthenticatedRoute element={<Suggestions />} /> },
                { path: 'manage-collections', element: <AuthorizedRoute element={<ManageCollections />} requiredPermission="collections" /> },
                { path: 'manage-study-sets', element: <AuthenticatedRoute element={<ManageStudySets />} /> },
                { path: 'manage-user-permissions', element: <AuthorizedRoute element={<ManageUserPermissions />} requiredPermission="admin" /> },
                { path: 'collections/:collectionName', element: <AuthenticatedRoute element={<CollectionDetails />} /> },
                { path: 'collections/randomset/:collectionName', element: <AuthenticatedRoute element={<RandomSet />} /> },
                { path: '/edit-studyset-slides/:id', element: <AuthenticatedRoute element={<EditSlides />} /> },
            ],
        },
        { path: '/landing', element: <LandingPage /> },
        { path: '/demo-viewer', element: <DemoViewer /> },
        { path: '/view-image', element: <AuthenticatedRoute element={<ImageViewer />} /> },
        { path: '*', element: <NotFound /> },
    ]);

    return <RouterProvider router={router} />;
}

export default App;