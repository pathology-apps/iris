import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Table, message, Select, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CreateStudySet = ({ setError, setSuccess }) => {
  const [slides, setSlides] = useState([]);
  const [selectedSlides, setSelectedSlides] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [existingStudySets, setExistingStudySets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [slidesResponse, studySetsResponse] = await Promise.all([
          fetch(`/api/collections/All`),
          axios.get('/api/study-sets'),
        ]);

        const slidesData = await slidesResponse.json();
        setSlides(slidesData);
        setFilteredSlides(slidesData);

        setExistingStudySets(studySetsResponse.data);
      } catch (err) {
        if (setError) setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [setError]);

  const isDuplicateTitle = (newTitle) => {
    return existingStudySets.some(
      (set) => set.title.toLowerCase().trim() === newTitle.toLowerCase().trim()
    );
  };

  const handleOpenImage = (url) => {
    const decodedImageUrl = decodeURIComponent(url);
    const newTabUrl = `/view-image?imageUrl=${encodeURIComponent(
      `https://pathapp-ap-ds14a.med.umich.edu:9093/imageserver/fcgi-bin/iipsrv.fcgi?DeepZoom=${decodedImageUrl}.dzi`
    )}`;
    window.open(newTabUrl, '_blank');
  };

  const handleSelectSlide = (slideId) => {
    setSelectedSlides((prev) =>
      prev.includes(slideId) ? prev.filter((id) => id !== slideId) : [...prev, slideId]
    );
  };

  const handleSubmit = async () => {
    if (!title) {
      if (setError) setError('Name is required');
      return;
    }

    if (isDuplicateTitle(title)) {
      message.error('A study set with this name already exists. Please choose a different name.');
      return;
    }

    try {
      const username = sessionStorage.getItem('username') || '';
      const response = await axios.post('/api/study-set-create', {
        title,
        description,
        username,
        slide_ids: selectedSlides,
      });

      if (response.status !== 201) {
        throw new Error('Failed to create study set');
      }

      setTitle('');
      setDescription('');
      setSelectedSlides([]);
      if (setSuccess) setSuccess(true);
      if (setError) setError(null);
    } catch (err) {
      if (setError) setError(err.message);
      if (setSuccess) setSuccess(false);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = slides.filter((item) =>
      (item.diagnosis && item.diagnosis.toLowerCase().includes(value)) ||
      (item.organ && item.organ.toLowerCase().includes(value)) ||
      (item.stain && item.stain.toLowerCase().includes(value)) ||
      (item.id && item.id.toString().toLowerCase().includes(value))
    );
    setFilteredSlides(filtered);
    setCurrentPage(1);
  };

  const paginatedSlides = filteredSlides.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredSlides.length / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: '',
      dataIndex: 'id',
      key: 'select',
      width: 50,
      sorter: (a, b) => {
        const aSelected = selectedSlides.includes(a.id);
        const bSelected = selectedSlides.includes(b.id);
        return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
      },
      render: (_, record) => (
        <Checkbox
          checked={selectedSlides.includes(record.id)}
          onChange={() => handleSelectSlide(record.id)}
        />
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      sorter: (a, b) => a.id - b.id,
      render: (text, record) => (
        <Button type="primary" onClick={() => handleOpenImage(record.new_url)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 250,
      sorter: (a, b) => (a.diagnosis || '').localeCompare(b.diagnosis || ''),
    },
    {
      title: 'Organ',
      dataIndex: 'organ',
      key: 'organ',
      width: 200,
      sorter: (a, b) => (a.organ || '').localeCompare(b.organ || ''),
    },
    {
      title: 'Stain',
      dataIndex: 'stain',
      key: 'stain',
      width: 200,
      sorter: (a, b) => (a.stain || '').localeCompare(b.stain || ''),
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
        Create Study Set
      </h2>
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Name</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Description</div>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Search slides"
            value={searchText}
            onChange={handleSearch}
            style={{ width: '300px', marginTop: 20 }}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{ float: 'right', marginTop: 20 }}
          >
            Create Study Set
          </Button>
        </Form.Item>
        <Table
          columns={columns}
          dataSource={paginatedSlides.map((slide) => ({ ...slide, key: slide.id }))}
          pagination={false}
          rowKey="id"
          rowClassName={(record) => (selectedSlides.includes(record.id) ? 'selected-row' : '')}
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
          <span>per page ({filteredSlides.length} slides)</span>
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

export default CreateStudySet;