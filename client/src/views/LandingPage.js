import React, { useState } from 'react';
import { Button, Card, Typography, Space, Divider } from 'antd';
import { EyeOutlined, InfoCircleOutlined, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
    const navigate = useNavigate();
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const handleOpenViewer = () => {
        // Open the image viewer in a new tab with a sample iris image
        const viewerUrl = '/view-image?slideId=425248&serverUrl=http://pathapp-ap-ds14a.med.umich.edu:3003';
        window.open(viewerUrl, '_blank');
    };

    const handleOpenDemo = () => {
        // Open the demo viewer in a new tab
        const demoUrl = '/demo-viewer';
        window.open(demoUrl, '_blank');
    };

    const handleGoToApp = () => {
        navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                gap: '15px'
            }}>
                <Button 
                    type="text" 
                    style={{ color: 'white', borderColor: 'white' }}
                    onClick={handleGoToApp}
                >
                    Go to App
                </Button>
            </div>

            {/* Main Content */}
            <div style={{
                maxWidth: '800px',
                textAlign: 'center',
                color: 'white'
            }}>
                <Title level={1} style={{ 
                    color: 'white', 
                    marginBottom: '20px',
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    Iris Image Viewer
                </Title>
                
                <Paragraph style={{
                    fontSize: '1.2rem',
                    marginBottom: '40px',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '1.6'
                }}>
                    Explore high-resolution medical images with our advanced viewing technology. 
                    Built for pathologists, researchers, and medical professionals.
                </Paragraph>

                {/* Feature Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <Card style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '15px'
                    }}>
                        <EyeOutlined style={{ fontSize: '2rem', color: '#ffdc00', marginBottom: '10px' }} />
                        <Title level={4} style={{ color: 'white', marginBottom: '10px' }}>
                            High-Resolution Viewing
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Zoom and pan through gigapixel images with smooth performance
                        </Text>
                    </Card>

                    <Card style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '15px'
                    }}>
                        <InfoCircleOutlined style={{ fontSize: '2rem', color: '#ffdc00', marginBottom: '10px' }} />
                        <Title level={4} style={{ color: 'white', marginBottom: '10px' }}>
                            Medical Grade
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Designed specifically for pathology and medical imaging workflows
                        </Text>
                    </Card>

                    <Card style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '15px'
                    }}>
                        <GithubOutlined style={{ fontSize: '2rem', color: '#ffdc00', marginBottom: '10px' }} />
                        <Title level={4} style={{ color: 'white', marginBottom: '10px' }}>
                            Open Source
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Built on open-source technologies for transparency and collaboration
                        </Text>
                    </Card>
                </div>

                {/* Action Buttons */}
                <Space size="large" style={{ marginBottom: '40px' }}>
                    <Button 
                        type="primary" 
                        size="large"
                        style={{
                            height: '50px',
                            padding: '0 30px',
                            fontSize: '1.1rem',
                            borderRadius: '25px',
                            background: '#ffdc00',
                            borderColor: '#ffdc00',
                            color: '#00274C',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(255, 220, 0, 0.3)'
                        }}
                        onClick={handleOpenDemo}
                    >
                        <EyeOutlined style={{ marginRight: '8px' }} />
                        View Sample Image
                    </Button>
                    
                    <Button 
                        size="large"
                        style={{
                            height: '50px',
                            padding: '0 30px',
                            fontSize: '1.1rem',
                            borderRadius: '25px',
                            background: 'transparent',
                            borderColor: 'white',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                        onClick={handleGoToApp}
                    >
                        Explore Collections
                    </Button>
                </Space>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                {/* Footer Info */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                        © 2024 Iris Image Viewer. Built with React and OpenSeadragon.
                    </Text>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Powered by IIPImage Server
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage; 