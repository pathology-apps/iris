import React, { useState, useEffect } from 'react';
import { Alert, Tabs } from 'antd';
import CreateStudySet from './CreateStudySet';
import ModifyStudySets from './ModifyStudySets';
import { fetchUserPermissions } from '../AppComponent.js';

const ManageStudySets = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('modify');
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const loadPermissions = async () => {
      const permissions = await fetchUserPermissions();
      setUserPermissions(permissions);
    };

    loadPermissions();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const items = [];

  items.push({
    key: 'modify',
    label: 'Modify Study Sets',
    children: activeTab === 'modify' ? <ModifyStudySets setError={setError} /> : null,
  });

  if (userPermissions.includes('studysets')) {
    items.push({
      key: 'create',
      label: 'Create Study Set',
      children: <CreateStudySet setError={setError} setSuccess={setSuccess} />,
    });
  }


  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '2em', marginBottom: '30px' }}>Manage Study Sets</h2>
      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />
      )}
      {success && (
        <Alert message="Study set created successfully!" type="success" showIcon style={{ marginBottom: '20px' }} />
      )}
      <Tabs items={items} activeKey={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default ManageStudySets;