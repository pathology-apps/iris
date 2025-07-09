import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Spin, Modal, Form, message, Select, Alert } from 'antd';
import axios from 'axios';

const { Option } = Select;

const ManageCollections = () => {
  const [collections, setCollections] = useState([]);
  const [originalCollections, setOriginalCollections] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/collections');
      const decodedData = response.data
        .map(item => ({
          ...item,
          collection: decodeURIComponent(item.collection),
          group: decodeURIComponent(item.group),
          description: decodeURIComponent(item.description),
        }))
        .filter(item => item.collection !== 'All');
      setCollections(decodedData);
      setOriginalCollections(decodedData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Error fetching collections');
    } finally {
      setLoading(false);
    }
  };

  const isDuplicateName = (collection, shortName, currentId = null) => {
    const trimLower = str => str.trim().toLowerCase();
    return collections.some(item => (
      (item.id !== currentId) && (
        trimLower(item.collection) === trimLower(collection) ||
        trimLower(item.description) === trimLower(shortName)
      )
    ));
  };

  const handleEdit = (record) => {
    setEditingKey(record.id);
    form.setFieldsValue({
      collection: record.collection,
      group: record.group,
      description: record.description,
    });
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this collection?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`/api/collections/deletecollection/${id}`);
          message.success('Collection deleted successfully');
          fetchCollections();
        } catch (error) {
          console.error('Error deleting collection:', error);
          message.error('Failed to delete the collection');
        }
      },
    });
  };

  const handleSave = async (id) => {
    try {
      const values = await form.validateFields();
      if (isDuplicateName(values.collection, values.description, id)) {
        message.error('Collection Name or Short Name already exists');
        return;
      }

      await axios.put(`/api/collections/updatecollection/${id}`, {
        collection: encodeURIComponent(values.collection),
        group: encodeURIComponent(values.group),
        description: encodeURIComponent(values.description),
      });
      setEditingKey('');
      message.success('Collection updated successfully');
      fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      message.error('Failed to update the collection');
    }
  };

  const handleAddNew = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (isDuplicateName(values.collection, values.shortName)) {
        message.error('Collection Name or Short Name already exists');
        return;
      }

      await axios.post('/api/collections/addcollection', {
        collection: encodeURIComponent(values.collection),
        group: encodeURIComponent(values.group),
        description: encodeURIComponent(values.shortName),
      });
      setIsModalVisible(false);
      modalForm.resetFields();
      message.success('Collection added successfully');
      fetchCollections();
    } catch (error) {
      console.error('Error adding collection:', error);
      message.error('Failed to add the collection');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    modalForm.resetFields();
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filteredCollections = originalCollections.filter(item =>
      item.collection.toLowerCase().includes(value) ||
      item.group.toLowerCase().includes(value) ||
      item.description.toLowerCase().includes(value)
    );
    setCollections(filteredCollections);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: 'Collection',
      dataIndex: 'collection',
      key: 'collection',
      sorter: (a, b) => a.collection.localeCompare(b.collection),
      render: (text, record) =>
        editingKey === record.id ? (
          <Form.Item
            name="collection"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please enter the collection name' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: 'Description',
      dataIndex: 'group',
      key: 'group',
      sorter: (a, b) => a.group.localeCompare(b.group),
      render: (text, record) =>
        editingKey === record.id ? (
          <Form.Item name="group" style={{ margin: 0 }}>
            <Input />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: 'Short Name',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
      render: (text, record) =>
        editingKey === record.id ? (
          <Form.Item
            name="description"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please enter the short name' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        editingKey === record.id ? (
          <span>
            <Button onClick={() => handleSave(record.id)} style={{ marginRight: 8 }}>
              Save
            </Button>
            <Button onClick={() => setEditingKey('')}>Cancel</Button>
          </span>
        ) : (
          <span>
            <Button onClick={() => handleEdit(record)} style={{ marginRight: 8, backgroundColor: '#ffa500', borderColor: '#ffa500' }}>
              Edit
            </Button>
            <Button onClick={() => handleDelete(record.id)} style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}>
              Delete
            </Button>
          </span>
        ),
    },
  ];

  const paginatedCollections = collections.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(collections.length / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Spin tip="Loading...">
        <div style={{ minHeight: 'calc(100vh - 200px)' }}></div>
      </Spin>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '2em', marginBottom: '30px' }}>Manage Collections</h2>
      <Form.Item>
        <Input
          placeholder="Search collections"
          value={searchText}
          onChange={handleSearch}
          style={{ width: '300px', marginTop: '20px' }}
        />
        <Button type="primary" onClick={handleAddNew} style={{ float: 'right', marginTop: 20 }}>
          Add New Collection
        </Button>
      </Form.Item>
      <Form form={form} component={false}>
        <Table
          columns={columns}
          dataSource={paginatedCollections}
          pagination={false}
          rowKey="id"
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
          <span>per page ({collections.length} collections)</span>
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
      <Modal
        title="Add New Collection"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            label="Collection Name"
            name="collection"
            rules={[{ required: true, message: 'Please enter the collection name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="group"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Short Name"
            name="shortName"
            rules={[{ required: true, message: 'Please enter the short name' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCollections;