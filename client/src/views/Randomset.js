import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Collapse, Spin, Alert } from 'antd';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { extractStainNameFromUrl } from './CollectionDetails.js';

const RandomSet = () => {
    const { collectionName } = useParams();
    const [randomTestSet, setRandomTestSet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDiagnoses, setUserDiagnoses] = useState({});
    const [revealedDiagnoses, setRevealedDiagnoses] = useState({});

    const location = useLocation();
    const collection = location.state?.collection || 'Unnamed Set';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const encodedName = encodeURIComponent(collectionName);
                const response = await axios.get(`/api/collections/randomset/${encodedName}`);
                setRandomTestSet(response.data);
            } catch (error) {
                setError('Error fetching random test set');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [collectionName]);

    // const handleOpenImage = (url) => {
    //     const decodedImageUrl = decodeURIComponent(url);
    //     const newTabUrl = `/view-image?imageUrl=${encodeURIComponent(`https://pathapp-ap-ds14a.med.umich.edu:9093/imageserver/fcgi-bin/iipsrv.fcgi?DeepZoom=${decodedImageUrl}.dzi`)}`;
    //     window.open(newTabUrl, '_blank');
    // };
    const handleOpenImage = (id, url) => {
        const stainName = extractStainNameFromUrl(url);
        
        const decodedUrl = decodeURIComponent(url);
        // console.log('Decoded URL:', decodedUrl);
        // const urlLastSlashIndex = decodedUrl.lastIndexOf('/');
        // const baseUrl = decodedUrl.substring(0, urlLastSlashIndex + 1);

        const newTabUrl = `/view-image?type=random&urls=${encodeURIComponent(JSON.stringify([decodedUrl]))}`;
        window.open(newTabUrl, '_blank');
    };

    const handleOpenAllImages = (urls) => {
        const fullImageUrls = urls.map(url => `https://pathapp-ap-ds14a.med.umich.edu:9093/imageserver/fcgi-bin/iipsrv.fcgi?DeepZoom=${url}.dzi`);
        const encodedUrls = encodeURIComponent(JSON.stringify(fullImageUrls));
        const newTabUrl = `/view-image?imageUrls=${encodedUrls}`;
        window.open(newTabUrl, '_blank');
    };

    const openSlides = (slides) => {
        console.log('Opening slides:', slides);
        if (slides.length === 1) {
            handleOpenImage(slides[0].id, slides[0].new_url);
        } else if (slides.length > 1) {
            const urls = slides.map(slide => slide.new_url);
            handleOpenAllImages(urls);
        }
    };

    const handleDiagnosisChange = (accession, value) => {
        setUserDiagnoses(prev => ({ ...prev, [accession]: value }));
    };

    const revealDiagnosis = (accession) => {
        setRevealedDiagnoses(prev => ({ ...prev, [accession]: !prev[accession] }));
    };

    const casesByAccession = randomTestSet.reduce((acc, item) => {
        if (!acc[item.COLUMN06]) {
            acc[item.COLUMN06] = [];
        }
        acc[item.COLUMN06].push(item);
        return acc;
    }, {});

    const numberOfCases = Object.keys(casesByAccession).length;

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    const items = Object.entries(casesByAccession).map(([accession, cases], index) => ({
        key: accession,
        label: `Case ${index + 1} - ${cases[0].NAME || 'Unknown'}`,
        children: (
            <Card>
                <Button type="primary" onClick={() => openSlides(cases)} style={{ marginBottom: '10px' }}>
                    Open Slides
                </Button>
                <div style={{ marginTop: '10px' }}>
                    <Input
                        placeholder="Type your diagnosis"
                        value={userDiagnoses[accession] || ''}
                        onChange={(e) => handleDiagnosisChange(accession, e.target.value)}
                        style={{ width: '70%', marginRight: '10px' }}
                    />
                    <Button onClick={() => revealDiagnosis(accession)}>
                        {revealedDiagnoses[accession] ? 'Hide' : 'Reveal'} Actual Diagnosis
                    </Button>
                    {revealedDiagnoses[accession] && (
                        <div style={{ marginTop: '10px' }}>
                            <strong>Actual Diagnosis:</strong> {cases[0].COLUMN03 || 'Not Available'}
                        </div>
                    )}
                </div>
            </Card>
        ),
    }));

    const defaultActiveKeys = items.map(item => item.key);

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip="Loading...">
                {loading ? (
                    <div style={{ minHeight: '200px' }}></div>
                ) : (
                    <>
                        <h2>{`${numberOfCases} Random Case${numberOfCases !== 1 ? 's' : ''} from ${collection}`}</h2>
                        <Collapse defaultActiveKey={defaultActiveKeys} items={items} />
                    </>
                )}
            </Spin>
        </div>
    );
};

export default RandomSet;