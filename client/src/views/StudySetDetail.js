import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Spin, Select } from 'antd';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { extractStainNameFromUrl } from './CollectionDetails.js';

const { Option } = Select;

const StudySetDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const studySetName = location.state?.title || 'Unnamed Set';
    const [cases, setCases] = useState([]);
    const [originalCases, setOriginalCases] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        const fetchStudySetDetails = async () => {
            try {
                const response = await axios.get(`/api/study-sets/${id}?type=3`);
                response.data ? groupCases(response.data) : groupCases([]);
                console.log('Study Set Details:', response.data);
            } catch (error) {
                console.error('Error fetching cases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudySetDetails();
    }, [id]);

    const groupCases = (data) => {
        const grouped = data.reduce((acc, slide) => {
            const key = slide.COLUMN06 || slide.PARENTID;
            if (!acc[key]) {
                acc[key] = {
                    specimen: slide.NAME || 'Unknown',
                    diagnosis: slide.COLUMN03 || 'Unknown',
                    stain: slide.SHORTNAME || 'Unknown',
                    slides: [],
                };
            }
            acc[key].slides.push({
                id: slide.PARENTID,
                new_url: slide.new_url,
                stain: slide.SHORTNAME || 'Unknown',
                imageid: slide.IMAGEID || 'Unknown',
            });
            return acc;
        }, {});

        const caseArray = Object.keys(grouped).map((key, index) => ({
            caseName: `Case ${index + 1}`,
            specimen: grouped[key].specimen,
            diagnosis: grouped[key].diagnosis,
            stain: grouped[key].stain,
            slides: grouped[key].slides,
        }));

        setCases(caseArray);
        setOriginalCases(caseArray);
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchText(value);
        const filteredData = originalCases.filter(item =>
            item.caseName.toLowerCase().includes(value) ||
            item.specimen.toLowerCase().includes(value) ||
            item.diagnosis.toLowerCase().includes(value)
        );
        setCases(filteredData);
        setCurrentPage(1);
    };

    const handleOpenImage = (caseName, id, url) => {
        const decodedUrl = decodeURIComponent(url);
        const stainName = extractStainNameFromUrl(url);

        const urlLastSlashIndex = decodedUrl.lastIndexOf('/');
        const baseUrl = decodedUrl.substring(0, urlLastSlashIndex + 1);

        const newTabUrl = `/view-image?urls=${encodeURIComponent(JSON.stringify([baseUrl]))}&imageIds=${encodeURIComponent(JSON.stringify([id]))}&caseName=${encodeURIComponent(caseName)}&stains=${encodeURIComponent(JSON.stringify([stainName]))}`;
        window.open(newTabUrl, '_blank');
    };

    const handleOpenAllImages = (caseName, ids, urls) => {
        const stains = urls.map(url => extractStainNameFromUrl(url));

        const decodedUrls = urls.map(url => decodeURIComponent(url));
        const baseUrls = decodedUrls.map(decodedUrl => {
            const lastSlashIndex = decodedUrl.lastIndexOf('/');
            return decodedUrl.substring(0, lastSlashIndex + 1);
        });

        const newTabUrl = `/view-image?urls=${encodeURIComponent(JSON.stringify(baseUrls))}&imageIds=${encodeURIComponent(JSON.stringify(ids))}&caseName=${encodeURIComponent(caseName)}&stains=${encodeURIComponent(JSON.stringify(stains))}`;
        window.open(newTabUrl, '_blank');
    };
    
    const openSlides = (slides, caseName) => {
        console.log('Opening slides for case:', caseName, 'with slides:', slides);
        if (slides.length === 1) {
            console.log('slide url: ', slides[0].new_url);
            handleOpenImage(caseName, slides[0].imageid, slides[0].new_url);
        } else if (slides.length > 1) {
            const stains = slides.map(slide => slide.stain);
            const ids = slides.map(slide => slide.imageid);
            const urls = slides.map(slide => slide.new_url);
            handleOpenAllImages(caseName, ids, urls);
        }
    };

    const columns = [
        {
            title: 'Case Number',
            dataIndex: 'caseName',
            key: 'caseName',
            render: (caseName, record) => (
                <Button 
                    type="link" 
                    onClick={() => openSlides(record.slides, caseName)}
                >
                    {caseName}
                </Button>
            ),
        },
        {
            title: 'Specimen',
            dataIndex: 'specimen',
            key: 'specimen',
        },
        {
            title: 'Diagnosis',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button onClick={() => openSlides(record.slides, record.caseName)}>Open Slides</Button>
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

    const paginatedCases = cases.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(cases.length / pageSize);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>{`Study Set: ${studySetName}`}</h1>
            <Input
                placeholder="Search cases"
                value={searchText}
                onChange={handleSearch}
                style={{ width: '300px', marginBottom: '20px' }}
            />
            <Table
                columns={columns}
                dataSource={paginatedCases}
                pagination={false}
                rowKey="caseName"
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Select defaultValue={pageSize} style={{ width: 100, marginRight: 8 }} onChange={handlePageSizeChange}>
                        <Option value={10}>10</Option>
                        <Option value={25}>25</Option>
                        <Option value={50}>50</Option>
                        <Option value={100}>100</Option>
                    </Select>
                    <span>per page ({cases.length} cases)</span>
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

export default StudySetDetail;