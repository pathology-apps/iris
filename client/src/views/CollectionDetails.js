import React, { useState, useEffect } from 'react';
import { Table, Button, Spin, Alert, Input, Select, Empty } from 'antd';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import './css/CollectionDetails.css';

const { Option } = Select;

export const extractStainNameFromUrl = (url) => {
    const decodedUrl = decodeURIComponent(url);
    const lastSlashIndex = decodedUrl.lastIndexOf('/');
    const afterLastSlash = decodedUrl.substring(lastSlashIndex + 1);
    const lastUnderscoreIndex = afterLastSlash.lastIndexOf('_');
    return afterLastSlash.substring(0, lastUnderscoreIndex);
};

const CollectionDetails = () => {
  const { collectionName } = useParams();
  const location = useLocation();
  const collection = location.state?.collection || 'Unnamed Set';
  const hideDiagnosis = location.state && location.state.hideDiagnosis;

  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredGroups, setFilteredGroups] = useState({});
  const [hoveredAccession, setHoveredAccession] = useState(null);
  const [diagnosisVisibility, setDiagnosisVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const fetchCollectionItems = async () => {
      setLoading(true);
      try {
        const encodedName = encodeURIComponent(collectionName);
        const response = await axios.get(`/api/collections/${encodedName}`);
        if (!response.data || response.data.length === 0) {
          setItems({});
          setFilteredGroups({});
        } else {
          const groupedByAccession = groupByAccession(response.data);
          setItems(groupedByAccession);
          setFilteredGroups(groupedByAccession);
        }
      } catch (error) {
        setError('Error fetching collection items');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionItems();
  }, [collectionName]);

  const handleOpenImage = (id, url) => {
    const stainName = extractStainNameFromUrl(url);
    
    const decodedUrl = decodeURIComponent(url);
    console.log('Decoded URL:', decodedUrl);
    const urlLastSlashIndex = decodedUrl.lastIndexOf('/');
    const baseUrl = decodedUrl.substring(0, urlLastSlashIndex + 1);

    const newTabUrl = `/view-image?urls=${encodeURIComponent(JSON.stringify([baseUrl]))}&imageIds=${encodeURIComponent(JSON.stringify([id]))}&stains=${encodeURIComponent(JSON.stringify([stainName]))}`;
    window.open(newTabUrl, '_blank');
  };

  const handleOpenAllImages = (urls, ids) => {
    console.log('Opening all images:', urls);
    const stains = urls.map(url => extractStainNameFromUrl(url));
    const decodedUrls = urls.map(url => decodeURIComponent(url));
    //now go get the base url from each decoded URL
    const baseUrls = decodedUrls.map(decodedUrl => {
      const lastSlashIndex = decodedUrl.lastIndexOf('/');
      return decodedUrl.substring(0, lastSlashIndex + 1);
    });

    const newTabUrl = `/view-image?urls=${encodeURIComponent(JSON.stringify(baseUrls))}&imageIds=${encodeURIComponent(JSON.stringify(ids))}&stains=${encodeURIComponent(JSON.stringify(stains))}`;
    window.open(newTabUrl, '_blank');
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = Object.entries(items).reduce((acc, [accession, group]) => {
      const matches = group.filter(item =>
        (item.diagnosis && item.diagnosis.toLowerCase().includes(value)) ||
        (item.organ && item.organ.toLowerCase().includes(value)) ||
        (item.stain && item.stain.toLowerCase().includes(value)) ||
        (item.id && String(item.id).toLowerCase().includes(value))
      );
      if (matches.length > 0) acc[accession] = matches;
      return acc;
    }, {});
    setFilteredGroups(filtered);
  };

  const groupByAccession = (items) => {
    return items.reduce((acc, item) => {
      const key = item.accession || 'No Accession';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const toggleDiagnosisVisibility = (id) => {
    setDiagnosisVisibility((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const columns = [
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_, record) => {
        const group = filteredGroups[record.accession];
        const isFirstItem = group && group[0].id === record.id;

        if (group.length > 1 && isFirstItem) {
          return {
            children: (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  onClick={() => handleOpenAllImages(group.map(item => item.new_url), group.map(item => item.id))}
                  onMouseEnter={() => setHoveredAccession(record.accession)}
                  onMouseLeave={() => setHoveredAccession(null)}
                >
                  Open All
                </Button>
              </div>
            ),
            props: {
              rowSpan: group.length,
            },
          };
        } else if (group.length === 1) {
          return {
            children: <div>{}</div>,
          };
        } else {
          return {
            children: '',
            props: {
              rowSpan: 0,
            }
          };
        }
      },
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleOpenImage(record.id, record.new_url)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: '40%',
      render: (text, record) => {
        const isVisible = diagnosisVisibility[record.id];
        if (hideDiagnosis) {
          if (!isVisible) {
            return (
              <Button onClick={() => toggleDiagnosisVisibility(record.id)}>Peek</Button>
            );
          } else {
            return (
              <div>
                <Button style={{ marginRight: '10px' }} onClick={() => toggleDiagnosisVisibility(record.id)}>Hide</Button> {text}
              </div>
            );
          }
        } else {
          return (
            <div>
              {text}
            </div>
          );
        }
      },
    },
    {
      title: 'Organ',
      dataIndex: 'organ',
      key: 'organ',
      width: '20%',
    },
    {
      title: 'Stain',
      dataIndex: 'stain',
      key: 'stain',
      width: '20%',
    },
  ];

  const totalSlides = Object.values(filteredGroups).reduce((total, group) => total + group.length, 0);

  if (loading) {
    return <Spin tip="Loading...">
              <div style={{ minHeight: 'calc(100vh - 200px)' }}></div>
            </Spin>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  const groupEntries = Object.entries(filteredGroups);

  const paginatedGroups = (() => {
    let pages = [];
    let current = [];
    let count = 0;
    for (const [, group] of groupEntries) {
      if (count + group.length > pageSize && current.length > 0) {
        pages.push(current);
        current = [];
        count = 0;
      }
      current = current.concat(group.map(item => ({ ...item, key: item.id, dataAccession: group[0].accession })));
      count += group.length;
    }
    if (current.length > 0) pages.push(current);
    return pages;
  })();

  const totalPages = paginatedGroups.length;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{decodeURIComponent(collection)}</h2>
          <Input
            placeholder="Search items"
            value={searchText}
            onChange={handleSearch}
            style={{ width: '300px', marginBottom: '20px' }}
          />
          { totalSlides === 0 ?
              <Empty description="No slides available in this collection" />
            :
              <Table
                columns={columns}
                dataSource={paginatedGroups[currentPage - 1] || []}
                pagination={false}
                rowKey="id"
                rowClassName={(record) => (
                  hoveredAccession === record.accession ? 'highlighted-row' : ''
                )}
              />
          }
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select defaultValue={pageSize} style={{ width: 80 }} onChange={handlePageSizeChange}>
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
              </Select>
              <div style={{ marginLeft: 8 }}>per page ({totalSlides} slides)</div>
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

export default CollectionDetails;