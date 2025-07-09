import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Input, Modal, Form, message, Checkbox, Spin, Select } from "antd";

const { Option } = Select;

const ManageUserPermissions = () => {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users");
      console.log("Fetched users:", response.data);
      setUsers(response.data);
      setOriginalUsers(response.data);
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (user) => {
    try {
      const response = await axios.post("/api/users/adduser", user);
      console.log("User added:", response.data);

      setUsers([...users, response.data]);
      setOriginalUsers([...originalUsers, response.data]);
      message.success("User added successfully");
    } catch (error) {
      message.error("Failed to add user");
    }
  };

  const fetchUsernameSuggestions = async (searchValue) => {
    if (searchValue) {
      try {
        const { data } = await axios.get("/api/ldap/users", {
          params: { search: searchValue },
        });
        setUsernameSuggestions(data);
      } catch (error) {
        message.error("Failed to fetch username suggestions");
      }
    } else {
      setUsernameSuggestions([]);
    }
  };

  const updateUser = async (id, user) => {
    try {
      await axios.put(`/api/users/${id}`, user);
      const newUserList = users.map((u) => (u.id === id ? { ...u, ...user } : u));
      setUsers(newUserList);
      setOriginalUsers(newUserList);
      message.success("User updated successfully");
    } catch (error) {
      message.error("Failed to update user");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      const newUserList = users.filter((user) => user.id !== id);
      setUsers(newUserList);
      setOriginalUsers(newUserList);
      message.success("User deleted successfully");
    } catch (error) {
      message.error("Failed to delete user");
    }
  };

  const isDuplicateUsername = (username, currentId = null) => {
    return users.some(
      (user) =>
        user.username.toLowerCase() === username.toLowerCase() && user.id !== currentId
    );
  };

  const handleEdit = (record) => {
    setEditingKey(record.id);
    form.setFieldsValue({
      username: record.username,
      permissions: record.permissions,
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => deleteUser(id),
    });
  };

  const handleSave = async (id) => {
    try {
      const values = await form.validateFields();

      updateUser(id, values);
      setEditingKey("");
    } catch (error) {
      console.error("Save failed:", error);
      message.error("Failed to update user");
    }
  };

  const handleAddNew = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (isDuplicateUsername(values.username)) {
        message.error("Username already exists. Please choose a different username.");
        return;
      }

      addUser({ id: Date.now().toString(), ...values });
      setIsModalVisible(false);
      modalForm.resetFields();
    } catch (error) {
      console.error("Add failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    modalForm.resetFields();
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filteredUsers = originalUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(value) ||
        user.permissions.some((permission) =>
          permissionsMap[permission].toLowerCase().includes(value)
        )
    );
    setUsers(filteredUsers);
    setCurrentPage(1);
  };

  const permissionsMap = {
    admin: "Admin Page",
    collections: "Manage Collections",
    studysets: "Manage Study Sets",
  };

  const columns = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    sorter: (a, b) => a.username.localeCompare(b.username),
    render: (text, record) => text,
  },
  {
    title: "Permissions",
    dataIndex: "permissions",
    key: "permissions",
    render: (permissions, record) =>
      editingKey === record.id ? (
        <Form.Item name="permissions" style={{ margin: 0 }} valuePropName="value">
          <Checkbox.Group>
            {Object.keys(permissionsMap).map((key) => (
              <Checkbox key={key} value={key}>
                {permissionsMap[key]}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
      ) : (
        <div>
          {permissions.map((permission) => (
            <div key={permission}>{permissionsMap[permission]}</div>
          ))}
        </div>
      ),
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) =>
      editingKey === record.id ? (
        <span>
          <Button
            onClick={() => handleSave(record.id)}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Save
          </Button>
          <Button onClick={() => setEditingKey("")}>Cancel</Button>
        </span>
      ) : (
        <span>
          <Button
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8, backgroundColor: "#ffa500", borderColor: "#ffa500" }}
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(record.id)}
            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
          >
            Delete
          </Button>
        </span>
      ),
  },
];

  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(users.length / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontSize: "2em", marginBottom: "30px" }}>Manage User Permissions</h2>
      <Input
        placeholder="Search users"
        value={searchText}
        onChange={handleSearch}
        style={{ width: "300px", marginBottom: "20px" }}
      />
      <Button
        type="primary"
        onClick={handleAddNew}
        style={{ marginBottom: 20, float: "right" }}
      >
        Add New User
      </Button>
      <Spin spinning={loading} tip="Loading...">
        <Form form={form} component={false}>
          <Table columns={columns} dataSource={paginatedUsers} pagination={false} rowKey="id" />
        </Form>
      </Spin>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            defaultValue={pageSize}
            style={{ width: 100, marginRight: 8 }}
            onChange={handlePageSizeChange}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={25}>25</Option>
            <Option value={50}>50</Option>
          </Select>
          <span>per page ({users.length} users)</span>
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
        title="Add New User"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter a valid username" }]}
          >
            <Select
              showSearch
              placeholder="Search LDAP users"
              filterOption={false}
              onSearch={fetchUsernameSuggestions}
              notFoundContent={null}
            >
              {usernameSuggestions?.map((uname) => (
                <Option key={uname} value={uname}>
                  {uname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Select Permissions"
            rules={[{ required: true, message: "Please select at least one permission" }]}
          >
            <Checkbox.Group>
              {Object.keys(permissionsMap).map((key) => (
                <Checkbox key={key} value={key}>
                  {permissionsMap[key]}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUserPermissions;