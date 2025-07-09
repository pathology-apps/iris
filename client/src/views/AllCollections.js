import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Spin, Alert, Select } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const { Option } = Select;

const AllCollections = () => {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await axios.get('/api/collections');
                const decodedData = response.data.map(item => ({
                    ...item,
                    collection: decodeURIComponent(item.collection),
                    group: decodeURIComponent(item.group),
                    description: decodeURIComponent(item.description),
                    count: decodeURIComponent(item.count),
                }));
                setData(decodedData);
                setOriginalData(decodedData);
                console.log('Fetched collections:', decodedData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error fetching collections');
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchText(value);
        const filteredData = originalData.filter(item =>
            item.collection.toLowerCase().includes(value) ||
            item.description.toLowerCase().includes(value) ||
            item.count.toLowerCase().includes(value) ||
            item.group.toLowerCase().includes(value)
        );
        setData(filteredData);
        setCurrentPage(1);
    };

    const handleViewWithDiagnosis = (record) => {
        navigate(`/collections/${encodeURIComponent(record.description)}`, { state: { collection: record.collection } });
    };

    const handleViewWithoutDiagnosis = (record) => {
        navigate(`/collections/${encodeURIComponent(record.description)}`, { state: { hideDiagnosis: true, collection: record.collection } });
    };

    const fetchRandomTestSet = (record) => {
        navigate(`/collections/randomset/${encodeURIComponent(record.description)}`, { state: { collection: record.collection } });
    };

    const columns = [
        {
            title: 'Collection',
            dataIndex: 'collection',
            key: 'collection',
            sorter: (a, b) => a.collection.localeCompare(b.collection),
            render: (text, record) => (
                <Link to={`/collections/${encodeURIComponent(record.description)}`} state={{ collection: record.collection }}>
                    {text}
                </Link>
            ),
            width: '20%',
        },
        {
            title: 'Slide Count',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
            width: '10%',
        },
        {
            title: 'Description',
            dataIndex: 'group',
            key: 'group',
            sorter: (a, b) => a.group.localeCompare(b.group),
            width: '20%',
        },
        {
            title: 'Short Name',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            width: '10%',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <span>
                    <Button onClick={() => handleViewWithDiagnosis(record)} style={{ marginRight: 8 }}>View with Diagnosis</Button>
                    <Button onClick={() => handleViewWithoutDiagnosis(record)} style={{ marginRight: 8 }}>View without Diagnosis</Button>
                    <Button onClick={() => fetchRandomTestSet(record)}>Random Test Set</Button>
                </span>
            ),
            width: '40%',
        },
    ];

    if (loading) {
        return <Spin tip="Loading...">
                 <div style={{ minHeight: 'calc(100vh - 200px)' }}></div>
               </Spin>;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(data.length / pageSize);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Collections</h1>
            <Input
                placeholder="Search collections"
                value={searchText}
                onChange={handleSearch}
                style={{ width: '300px', marginBottom: '20px' }}
            />
            <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                rowKey="id"
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
                    <div>per page ({data.length} collections)</div>
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

export default AllCollections;