import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import IrisTileSource from './IrisTileSource';
import { ZoomInOutlined, ZoomOutOutlined, HomeOutlined, FullscreenOutlined, FileOutlined, LinkOutlined } from '@ant-design/icons';

const DemoViewer = () => {
    const osdViewerRef = useRef(null);
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Demo configuration - using a sample slide ID
    const demoSlideId = "cervix_2x_jpeg";
    const demoServerUrl = 'https://examples.restful.irisdigitalpathology.org';

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
                    IRIS Digital Pathology
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

            {/* Paper Preview Section */}
            <div style={{
                backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px 20px',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <FileOutlined style={{
                            fontSize: '32px',
                            marginRight: '15px',
                            color: '#fff'
                        }} />
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600'
                        }}>
                            The Iris File Extension
                        </h2>
                    </div>
                    
                    <p style={{
                        margin: '0 0 15px 0',
                        fontSize: '16px',
                        opacity: '0.9',
                        lineHeight: '1.6'
                    }}>
                        <strong>Ryan Erik Landvater MD MEng, Michael Olp MD, Mustafa Yousif MD, Ulysses Balis MD</strong>
                    </p>
                    
                    <p style={{
                        margin: '0 0 25px 0',
                        fontSize: '15px',
                        opacity: '0.8',
                        lineHeight: '1.6',
                        textAlign: 'left'
                    }}>
                        A modern digital pathology vendor-agnostic binary slide format specifically targeting the unmet need of efficient real-time transfer and display has not yet been established. The growing adoption of digital pathology only intensifies the need for an intermediary digital slide format that emphasizes performance for use between slide servers and image management software. The DICOM standard is a well-established format widely used for the long-term storage of both images and associated critical metadata. However, it was inherently designed for radiology rather than digital pathology, a discipline that imposes a unique set of performance requirements due to high-speed multi-pyramidal rendering within whole slide viewer applications. Here we introduce the Iris file extension, a binary container specification explicitly designed for performance-oriented whole slide image viewer systems. The Iris file extension specification is explicit and straightforward, adding modern compression support, a dynamic structure with fully optional metadata features, computationally trivial deep file validation, corruption recovery capabilities, and slide annotations. In addition to the file specification document, we provide source code to allow for (de)serialization and validation of a binary stream against the standard. We also provide corresponding binary builds with C++, Python, and JavaScript language support. Finally, we provide full encoder and decoder implementation source code, as well as binary builds (part of the separate Iris Codec Community module), with language bindings for C++ and Python, allowing for easy integration with existing WSI solutions. We provide the Iris File Extension specification openly to the community in the form of a Creative Commons Attribution-No Derivative 4.0 International license.
                    </p>
                    
                    <a 
                        href="https://arxiv.org/html/2506.10009v2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '25px',
                            textDecoration: 'none',
                            fontSize: '16px',
                            fontWeight: '500',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <LinkOutlined style={{
                            marginRight: '8px',
                            fontSize: '18px'
                        }} />
                        Read Full Paper
                    </a>
                </div>
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
                            <FullscreenOutlined style={iconStyle} onClick={handleFullscreen} />
                        </div>

                        {/* Zoom Info */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            zIndex: 1000
                        }}>
                            Zoom: {Math.round(zoomLevel * 100)}%
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
                        <br/>
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
                    
                    <p style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6'
                    }}>
                        <strong>Server Implementation:</strong> The Iris RESTful Server provides an extremely fast and lightweight HTTPS server for Iris File Extension encoded slide data transmission. It can support over 7,500 slide tile requests per second with under 35ms median response times. <br/><br/>
                        <a 
                            href="https://github.com/ryanlandvater/Iris-RESTful-Server?tab=readme-ov-file#api-explained" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                color: '#007bff',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.textDecoration = 'none';
                            }}
                        >
                            View the Iris RESTful Server repository →
                        </a>
                    </p>

                    {/* Example Metadata Response */}
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
                            Example Metadata Response
                        </h4>
                        <pre style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            padding: '15px',
                            margin: '0 0 15px 0',
                            overflow: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}>
{`{
    "type": "slide_metadata",
    "format": "FORMAT_B8G8R8A8",
    "encoding": "image/jpeg",
    "extent": {
        "width": 1983,
        "height": 1381,
        "layers": [
            {
                "x_tiles": 8,
                "y_tiles": 6,
                "scale": 1
            },
            {
                "x_tiles": 31,
                "y_tiles": 22,
                "scale": 4.0005
            },
            {
                "x_tiles": 124,
                "y_tiles": 87,
                "scale": 16.0035
            },
            {
                "x_tiles": 496,
                "y_tiles": 346,
                "scale": 64.0141
            }
        ]
    }
}`}
                        </pre>
                        <p style={{
                            margin: '0 0 10px 0',
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            <strong>Tile URL Example:</strong><br/>
                            <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>/slides/12345/layers/2/tiles/10</code>
                        </p>
                    </div>

                    {/* Position Calculation */}
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
                            How is <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>position</code> Calculated?
                        </h4>
                        <p style={{
                            margin: '0 0 10px 0',
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            The <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>position</code> in the tile API URL specifies which tile to fetch within a given layer. It is calculated using the tile's <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>x</code> and <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>y</code> coordinates and the number of tiles in the <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>x</code> direction for that layer:
                        </p>
                        <pre style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            padding: '15px',
                            margin: '10px 0',
                            overflow: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}>
{`layerPosition = y * x_tiles_in_layer + x`}
                        </pre>
                        <p style={{
                            margin: '0 0 10px 0',
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            For example, if a layer has <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>x_tiles = 31</code> and you want the tile at <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>x = 2</code>, <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace'
                            }}>y = 3</code>:
                        </p>
                        <pre style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            padding: '15px',
                            margin: '10px 0',
                            overflow: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}>
{`layerPosition = 3 * 31 + 2 = 95`}
                        </pre>
                        <p style={{
                            margin: '0 0 10px 0',
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            So the tile URL would be:
                        </p>
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
{`/slides/12345/layers/1/tiles/95`}
                        </pre>
                    </div>
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