import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import IrisTileSource from './IrisTileSource';
import { ZoomInOutlined, ZoomOutOutlined, HomeOutlined, FullscreenOutlined, CloseOutlined } from '@ant-design/icons';

const DemoViewer = () => {
    const osdViewerRef = useRef(null);
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Demo configuration - using a sample slide ID
    const demoSlideId = 425248;
    const demoServerUrl = 'http://pathapp-ap-ds14a.med.umich.edu:3003';

    useEffect(() => {
        console.log("Initializing demo viewer with slide ID:", demoSlideId, " and server URL:", demoServerUrl);
        
        if (!demoSlideId || !demoServerUrl) {
            console.warn("Missing slide ID or server URL.");
            return;
        }

        const tileSource = new IrisTileSource({ serverUrl: demoServerUrl, slideId: demoSlideId });

        const initializeViewer = () => {
            if (tileSource.ready && tileSource.width > 0 && tileSource.height > 0) {
                const osdViewer = OpenSeadragon({
                    id: 'demo-openseadragon-viewer',
                    tileSources: tileSource,
                    crossOriginPolicy: 'Anonymous',
                    showNavigator: true,
                    showNavigationControl: false,
                    showZoomControl: false,
                    showHomeControl: false,
                    showFullPageControl: false,

                    constrainDuringPan: true,

                    defaultVisibilityRatio: 0.5,
                    visibilityRatio: 1,

                    animationTime: 1.2,
                    springStiffness: 7.0,

                    zoomPerScroll: 2,
                    zoomPerClick: 2,
                    
                    minZoomLevel: 0.5,
                    maxZoomLevel: 64
                });

                osdViewer.addHandler('open', () => {
                    osdViewer.viewport.goHome();
                });

                osdViewer.addHandler('zoom', (event) => {
                    setZoomLevel(event.zoom);
                });

                osdViewerRef.current = osdViewer;
            } else {
                console.error("TileSource is not ready or provided invalid dimensions.");
            }
        };

        tileSource.addHandler('ready', initializeViewer);

        return () => {
            if (osdViewerRef.current) {
                console.log("Destroying OpenSeadragon viewer");
                osdViewerRef.current.destroy();
                osdViewerRef.current = null;
            }
        };
    }, []);

    const handleZoomIn = () => {
        if (osdViewerRef.current) {
            osdViewerRef.current.viewport.zoomBy(2);
            osdViewerRef.current.viewport.applyConstraints();
        }
    };

    const handleZoomOut = () => {
        if (osdViewerRef.current) {
            osdViewerRef.current.viewport.zoomBy(0.5);
            osdViewerRef.current.viewport.applyConstraints();
        }
    };

    const handleHome = () => {
        if (osdViewerRef.current) {
            osdViewerRef.current.viewport.goHome();
        }
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleClose = () => {
        window.close();
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#f5f5f5',
                overflow: 'auto',
                fontFamily: 'Arial, sans-serif'
            }}
        >
            {/* Header */}
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    margin: '0 0 10px 0',
                    color: '#333',
                    fontSize: '28px'
                }}>
                    Example: Iris TileSource Support
                </h1>
                <p style={{
                    margin: '0',
                    color: '#666',
                    fontSize: '16px',
                    lineHeight: '1.5'
                }}>
                    The <strong>IrisTileSource</strong> is an OpenSeadragon tilesource implementation for viewing images served by an Iris-compatible tile server. It is designed to efficiently display large, high-resolution images by loading only the visible tiles at the appropriate zoom level.
                </p>
            </div>

            {/* Content */}
            <div style={{
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <p style={{
                    margin: '0 0 20px 0',
                    color: '#333',
                    fontSize: '16px',
                    lineHeight: '1.6'
                }}>
                    The Iris API provides endpoints for retrieving image metadata and individual image tiles. OpenSeadragon's IrisTileSource fetches the metadata to determine the image's dimensions, available zoom levels, and tile layout, then requests tiles as needed while you pan and zoom.
                </p>

                {/* Demo Section */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#333',
                        fontSize: '20px'
                    }}>
                        Interactive Demo
                    </h3>
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        Below is a live example of the IrisTileSource in action. Use the controls to zoom, pan, and explore the high-resolution image.
                    </p>
                    
                    {/* Image Viewer Container */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '500px',
                        backgroundColor: '#000',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        {/* Control Bar */}
                        <div style={controlBarStyle}>
                            <ZoomInOutlined style={iconStyle} onClick={handleZoomIn} />
                            <ZoomOutOutlined style={iconStyle} onClick={handleZoomOut} />
                            <HomeOutlined style={iconStyle} onClick={handleHome} />
                        </div>

                        {/* OpenSeadragon Viewer */}
                        <div
                            id="demo-openseadragon-viewer"
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                            }}
                        />
                    </div>
                </div>

                {/* Configuration Section */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#333',
                        fontSize: '20px'
                    }}>
                        IrisTileSource Configuration
                    </h3>
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        To use the IrisTileSource, specify the <code style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>type</code> as <code style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>IrisTileSource</code> and provide the <code style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>serverUrl</code> (the base URL of your Iris server) and <code style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>slideId</code> (the image identifier).
                    </p>

                    <div style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '4px',
                        padding: '15px',
                        margin: '15px 0'
                    }}>
                        <h4 style={{
                            margin: '0 0 10px 0',
                            color: '#495057',
                            fontSize: '16px'
                        }}>
                            Example Configuration
                        </h4>
                        <pre style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            padding: '15px',
                            margin: '0',
                            overflow: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}>
{`OpenSeadragon({
  id: "example-iris-tilesource",
  prefixUrl: "/openseadragon/images/",
  tileSources: [{
      type: "IrisTileSource",
      serverUrl: "http://localhost:3000",
      slideId: "12345"
  }]
});`}
                        </pre>
                    </div>
                </div>

                {/* API Section */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#333',
                        fontSize: '20px'
                    }}>
                        Iris Metadata and Tile API
                    </h3>
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        The IrisTileSource interacts with two main API endpoints:
                    </p>
                    <ul style={{
                        margin: '0 0 15px 0',
                        paddingLeft: '20px',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        <li><strong>Metadata API:</strong> <code style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>/slides/{'{slideId}'}/metadata</code></li>
                        <li><strong>Tile API:</strong> <code style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>/slides/{'{slideId}'}/layers/{'{layerId}'}/tiles/{'{position}'}</code></li>
                    </ul>
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        The metadata endpoint returns information about the image, including its dimensions, available layers (zoom levels), and tile layout. The tile endpoint returns the image data for a specific tile at a given layer and position.
                    </p>
                </div>

                {/* How It Works Section */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#333',
                        fontSize: '20px'
                    }}>
                        How It Works
                    </h3>
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        When you initialize OpenSeadragon with the IrisTileSource, it first fetches the metadata for the specified slide. This metadata describes the image's size and how it is divided into tiles at each zoom level. As you pan and zoom, OpenSeadragon requests the appropriate tiles from the tile API endpoint and displays them in the viewer.
                    </p>
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        The IrisTileSource is ideal for large images where loading the entire image at once would be inefficient. By loading only the visible tiles, it provides a smooth and responsive viewing experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

const iconStyle = {
    fontSize: '24px',
    margin: '0 10px',
    cursor: 'pointer',
    color: '#007bff',
};

const controlBarStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: 'auto',
};

export default DemoViewer; 