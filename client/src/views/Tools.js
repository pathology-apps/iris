import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserPermissions } from '../AppComponent.js';

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

const Tools = () => {
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const loadPermissions = async () => {
      const permissions = await fetchUserPermissions();
      setUserPermissions(permissions);
    };

    loadPermissions();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2em', marginBottom: '30px' }}>Tools</h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '30px' }}>
        
        {userPermissions.includes('collections') && (
          <li>
            <Link
              to="/manage-collections"
              style={{ ...linkStyle, padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px' }}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              Manage Collections
            </Link>
          </li>
        )}
        <li>
          <Link
            to="/manage-study-sets"
            style={{ ...linkStyle, padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px' }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            Manage Study Sets
          </Link>
        </li>
        {userPermissions.includes('admin') && (
          <li>
            <Link
              to="/manage-user-permissions"
              style={{ ...linkStyle, padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px' }}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              Manage Permissions
            </Link>
          </li>
        )}
        
      </ul>
    </div>
  );
};

export default Tools;