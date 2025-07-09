import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Form, message, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

const ModifyStudySets = ({ setError }) => {
  const [studySets, setStudySets] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissionsAndName = async () => {
      try {
        const username = sessionStorage.getItem('username') || '';
        setUsername(username);
        console.log('Username from sessionStorage:', username);

        const userPermissionsResponse = await axios.get(`/api/users/permissions/${username}`);
        setUserPermissions(userPermissionsResponse.data);
        
        fetchStudySets(username, userPermissionsResponse.data);
      } catch (error) {
        console.error('Error fetching permissions or user details:', error);
        setError('Failed to fetch user info');
      }
    };

    fetchPermissionsAndName();
  }, []);

  const fetchStudySets = async (username, permissions) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/study-sets');
      let fetchedStudySets = response.data;
      console.log('Fetched study sets:', fetchedStudySets);
      
      if (!permissions.includes('studysets')) {
        fetchedStudySets = fetchedStudySets.filter((studySet) => studySet.username.trim() === username);
      }
      console.log('Filtered study sets:', fetchedStudySets);

      setStudySets(fetchedStudySets);
    } catch (error) {
      console.error('Error fetching study sets:', error);
      setError('Failed to load study sets');
    } finally {
      setLoading(false);
    }
  };

  const isDuplicateName = (title, currentId = null) => {
    return studySets.some(item => (
      item.pkey !== currentId && item.title.toLowerCase().trim() === title.toLowerCase().trim()
    ));
  };

  const handleEditSlides = (id) => {
    navigate(`/edit-studyset-slides/${id}`, {
      state: {
        title: studySets.find(set => set.pkey === id)?.title,
        description: studySets.find(set => set.pkey === id)?.description,
      },
    });
  };

  const deleteStudySet = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this study set?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`/api/study-sets/${id}`);
          message.success('Study set deleted successfully');
          fetchStudySets(username, userPermissions);
        } catch (error) {
          console.error('Error deleting study set:', error);
          setError('Failed to delete study set');
        }
      },
    });
  };

  const handleEdit = (record) => {
    form.setFieldsValue({ title: record.title, description: record.description });
    setEditingKey(record.pkey);
  };

  const saveChanges = async (id) => {
    try {
      const values = await form.validateFields();
      if (isDuplicateName(values.title, id)) {
        message.error('A study set with this name already exists. Please choose a different name.');
        return;
      }

      await axios.put(`/api/study-sets/${id}`, {
        title: values.title,
        description: values.description,
      });

      setEditingKey('');
      message.success('Study set updated successfully');
      fetchStudySets(username, userPermissions);
    } catch (error) {
      console.error('Error updating study set:', error);
      message.error('Failed to update study set');
    }
  };

  const cancelEdit = () => {
    setEditingKey('');
  };

  const paginatedStudySets = studySets.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(studySets.length / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const columnsStudySets = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) =>
        editingKey === record.pkey ? (
          <Form.Item
            name="title"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
      render: (text, record) =>
        editingKey === record.pkey ? (
          <Form.Item
            name="description"
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: 'Creator',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text) => (
        <span>{text}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        editingKey === record.pkey ? (
          <span>
            <Button
              onClick={() => saveChanges(record.pkey)}
              type="primary"
              style={{ marginRight: 8 }}
            >
              Save
            </Button>
            <Button onClick={cancelEdit}>Cancel</Button>
          </span>
        ) : (
          <span>
            <Button
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8, backgroundColor: '#ffa500', borderColor: '#ffa500', color: 'white' }}
            >
              Edit
            </Button>
            <Button
              onClick={() => deleteStudySet(record.pkey)}
              style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: 'white', marginRight: 8 }}
            >
              Delete
            </Button>
            <Button
              onClick={() => handleEditSlides(record.pkey)}
              type="default"
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
            >
              Edit Slides
            </Button>
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <Spin tip="Loading...">
        <div style={{ minHeight: 'calc(100vh - 200px)' }}></div>
      </Spin>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Modify Study Sets
      </h2>
      <Form form={form} component={false}>
        <Table
          columns={columnsStudySets}
          dataSource={paginatedStudySets}
          pagination={false}
          rowKey="pkey"
        />
      </Form>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select defaultValue={pageSize} style={{ width: 100, marginRight: 8 }} onChange={handlePageSizeChange}>
            <Option value={10}>10</Option>
            <Option value={25}>25</Option>
            <Option value={50}>50</Option>
            <Option value={100}>100</Option>
          </Select>
          <span>per page ({studySets.length} sets)</span>
        </div>
        <div>
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ marginRight: 8 }}
          >
            Previous
          </Button>
            Page {currentPage} of {totalPages}
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ marginLeft: 8 }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModifyStudySets;