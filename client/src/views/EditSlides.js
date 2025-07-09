import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Table, Button, Checkbox, Form, Input, message, Empty, Select, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const EditSlides = () => {
  const { id } = useParams();
  const location = useLocation();
  const studySetName = location.state?.title || 'Unnamed Set';
  const studySetDescription = location.state?.description || '';
  const [title, setTitle] = useState(studySetName);
  const [description, setDescription] = useState(studySetDescription);
  const [studySetSlides, setStudySetSlides] = useState([]);
  const [allSlides, setAllSlides] = useState([]);
  const [selectedSlides, setSelectedSlides] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentSlidesSearchText, setCurrentSlidesSearchText] = useState('');
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [filteredCurrentSlides, setFilteredCurrentSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentSlidesPage, setCurrentSlidesPage] = useState(1);
  const [availableSlidesPage, setAvailableSlidesPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchSlidesData = async () => {
      try {
        const studySetRes = await axios.get(`/api/study-sets/${id}?type=3`);
        const allSlidesRes = await axios.get('/api/collections/All');

        const studySetResData = studySetRes.data || [];

        setAllSlides(allSlidesRes.data);
        setStudySetSlides(studySetResData);
        setFilteredSlides(allSlidesRes.data);
        
        setSelectedSlides(studySetResData.map(slide => slide.IMAGEID));
      } catch (error) {
        message.error('Failed to retrieve data');
      } finally {
        setLoading(false);
      }
    };

    fetchSlidesData();
  }, [id]);

  useEffect(() => {
    if (!loading && studySetSlides.length > 0 && allSlides.length > 0) {
      setFilteredCurrentSlides(getCurrentSlides());
    } else {
      setFilteredCurrentSlides([]);
    }
  }, [studySetSlides, allSlides, loading]);

  const handleOpenImage = (url) => {
    const decodedImageUrl = decodeURIComponent(url);
    const newTabUrl = `/view-image?imageUrl=${encodeURIComponent(`https://pathapp-ap-ds14a.med.umich.edu:9093/imageserver/fcgi-bin/iipsrv.fcgi?DeepZoom=${decodedImageUrl}.dzi`)}`;
    window.open(newTabUrl, '_blank');
  };

  const handleSelectSlide = (slideId) => {
    setSelectedSlides((prev) =>
      prev.includes(slideId) ? prev.filter(id => id !== slideId) : [...prev, slideId]
    );
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = allSlides.filter(item =>
      (item.diagnosis && item.diagnosis.toLowerCase().includes(value)) ||
      (item.organ && item.organ.toLowerCase().includes(value)) ||
      (item.stain && item.stain.toLowerCase().includes(value)) ||
      (item.id && item.id.toString().toLowerCase().includes(value))
    );
    setFilteredSlides(filtered);
  };

  const handleCurrentSlidesSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setCurrentSlidesSearchText(value);
    const filtered = getCurrentSlides().filter(item =>
      (item.diagnosis && item.diagnosis.toLowerCase().includes(value)) ||
      (item.organ && item.organ.toLowerCase().includes(value)) ||
      (item.stain && item.stain.toLowerCase().includes(value)) ||
      (item.IMAGEID && item.IMAGEID.toString().toLowerCase().includes(value))
    );
    setFilteredCurrentSlides(filtered);
  };

  const getCurrentSlides = () => {
    return studySetSlides.map(studySlide => {
      const details = allSlides.find(slide => slide.id === studySlide.IMAGEID);
      return {
        ...studySlide,
        diagnosis: details ? details.diagnosis : '',
        organ: details ? details.organ : '',
        stain: details ? details.stain : '',
      };
    });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/study-sets/${id}`, {
        title,
        slide_ids: selectedSlides,
      });

      if (response.status !== 200) {
        throw new Error('Failed to update study set');
      }

      message.success('Study set saved successfully');
    } catch (err) {
      message.error(err.message);
    }
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentSlidesPage(1);
    setAvailableSlidesPage(1);
  };

  const columns = [
    {
      title: '',
      key: 'select',
      width: 50,
      render: (_, record) => {
        const slideId = record.id || record.IMAGEID;
        return (
          <Checkbox
            checked={selectedSlides.includes(slideId)}
            onChange={() => handleSelectSlide(slideId)}
          />
        );
      },
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text, record) => {
        const slideId = record.id || record.IMAGEID;
        return (
          <Button type="primary" onClick={() => handleOpenImage(record.new_url)}>
            {slideId}
          </Button>
        );
      },
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 250,
    },
    {
      title: 'Organ',
      dataIndex: 'organ',
      key: 'organ',
      width: 200,
    },
    {
      title: 'Stain',
      dataIndex: 'stain',
      key: 'stain',
      width: 200,
    },
  ];

  const getPaginatedData = (data, page) =>
    data.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <Spin tip="Loading...">
        <div style={{ minHeight: 'calc(100vh - 200px)' }}></div>
      </Spin>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '2em', marginBottom: '30px' }}>Edit Study Set Slides</h2>
      <Form layout="vertical">
        <Form.Item style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Name</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled />
        </Form.Item>
        <Form.Item style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Description</div>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled />
        </Form.Item>

        <h3>Current Slides in Study Set</h3>
        <Form.Item>
          <Input
            placeholder="Search slides"
            value={currentSlidesSearchText}
            onChange={handleCurrentSlidesSearch}
            style={{ width: '300px', marginBottom: 20 }}
          />
          <Button
            type="primary"
            onClick={handleSave}
            style={{ float: 'right', marginBottom: 20 }}
          >
            Save
          </Button>
        </Form.Item>
        
        {filteredCurrentSlides.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={getPaginatedData(filteredCurrentSlides, currentSlidesPage)}
              rowKey={(record) => record.IMAGEID || record.id}
              pagination={false}
            />
            <div style={{ paddingTop: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select defaultValue={pageSize} style={{ width: 100, marginRight: 8 }} onChange={handlePageSizeChange}>
                  <Option value={5}>5</Option>
                  <Option value={10}>10</Option>
                  <Option value={25}>25</Option>
                  <Option value={50}>50</Option>
                </Select>
                <span>per page ({filteredCurrentSlides.length} slides)</span>
              </div>
              <div>
                <Button
                  disabled={currentSlidesPage === 1}
                  onClick={() => setCurrentSlidesPage(currentSlidesPage - 1)}
                  style={{ marginRight: 8 }}
                >
                  Previous
                </Button>
                Page {currentSlidesPage} of {Math.ceil(filteredCurrentSlides.length / pageSize)}
                <Button
                  disabled={currentSlidesPage === Math.ceil(filteredCurrentSlides.length / pageSize)}
                  onClick={() => setCurrentSlidesPage(currentSlidesPage + 1)}
                  style={{ marginLeft: 8 }}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Empty description="No slides in current study set" />
        )}

        <h3>Available Slides</h3>
        <Form.Item>
          <Input
            placeholder="Search slides"
            value={searchText}
            onChange={handleSearch}
            style={{ width: '300px', marginBottom: 20 }}
          />
        </Form.Item>
        <Table
          columns={columns}
          dataSource={getPaginatedData(filteredSlides.filter(slide => !studySetSlides.some(studySlide => studySlide.IMAGEID === slide.id)), availableSlidesPage)}
          rowKey={(record) => record.id || record.IMAGEID}
          pagination={false}
        />
        {filteredSlides.filter(slide => !studySetSlides.some(studySlide => studySlide.IMAGEID === slide.id)).length > 0 && (
          <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select defaultValue={pageSize} onChange={handlePageSizeChange} style={{ width: 100, marginRight: 8 }}>
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
              </Select>
              <span>per page ({filteredSlides.length} slides)</span>
            </div>
            <div>
              <Button
                disabled={availableSlidesPage === 1}
                onClick={() => setAvailableSlidesPage(availableSlidesPage - 1)}
                style={{ marginRight: 8 }}
              >
                Previous
              </Button>
              Page {availableSlidesPage} of {Math.ceil(filteredSlides.length / pageSize)}
              <Button
                disabled={availableSlidesPage === Math.ceil(filteredSlides.length / pageSize)}
                onClick={() => setAvailableSlidesPage(availableSlidesPage + 1)}
                style={{ marginLeft: 8 }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};

export default EditSlides;