import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Spin, Alert, Select } from 'antd';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Option } = Select;

const StudySets = () => {
    const [studySets, setStudySets] = useState([]);
    const [originalStudySets, setOriginalStudySets] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudySets = async () => {
            try {
                const response = await axios.get('/api/study-sets');
                const decodedData = response.data.map(item => ({
                    ...item,
                    title: decodeURIComponent(item.title),
                }));
                setStudySets(decodedData);
                setOriginalStudySets(decodedData);
            } catch (err) {
                console.error('Error fetching study sets:', err);
                setError('Error fetching study sets');
            } finally {
                setLoading(false);
            }
        };

        fetchStudySets();
    }, []);

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchText(value);
        const filteredData = originalStudySets.filter(item =>
            item.title.toLowerCase().includes(value)
        );
        setStudySets(filteredData);
        setCurrentPage(1);
    };

    const openStudyset = (id, title) => {
        navigate(`/studysets/${id}`, { state: { title } });
    };

    const columns = [
        {
            title: 'Set Name',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (text, record) => (
                <Link to={`/studysets/${record.pkey}`} state={{ title: record.title }}>
                    {text}
                </Link>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button onClick={() => openStudyset(record.pkey, record.title)}>Open Studyset</Button>
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

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    const paginatedData = studySets.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(studySets.length / pageSize);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Study Sets</h1>
            <Input
                placeholder="Search study sets"
                value={searchText}
                onChange={handleSearch}
                style={{ width: '300px', marginBottom: '20px' }}
            />
            <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                rowKey="pkey"
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Select
                        defaultValue={pageSize}
                        style={{ width: 100, marginRight: 8 }}
                        onChange={handlePageSizeChange}
                    >
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

export default StudySets;