import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import IrisTileSource from './IrisTileSource';
import { useLocation } from 'react-router-dom';
import { ZoomInOutlined, ZoomOutOutlined, HomeOutlined, FullscreenOutlined } from '@ant-design/icons';

function ImageViewer() {
    const osdViewerRef = useRef(null);
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const slideId = params.get('slideId') || 425248;
    const serverUrl = params.get('serverUrl') || 'http://pathapp-ap-ds14a.med.umich.edu:3003';

    const [currentImage, setCurrentImage] = useState(slideId);

    useEffect(() => {
        console.log("Initializing viewer with slide ID:", currentImage, " and server URL:", serverUrl);
        if (!currentImage || !serverUrl) {
            console.warn("Missing slide ID or server URL.");
            return;
        }

        const tileSource = new IrisTileSource({ serverUrl, slideId: currentImage });

        const initializeViewer = () => {
            if (tileSource.ready && tileSource.width > 0 && tileSource.height > 0) {
                const osdViewer = OpenSeadragon({
                    id: 'openseadragon-viewer',
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
                    
                    // Let OpenSeadragon automatically determine zoom constraints from tile source
                    minZoomLevel: 0.5
                });

                osdViewer.addHandler('open', () => {
                    osdViewer.viewport.goHome();
                    
                    // Remove zoom constraints to allow unlimited zooming
                    // osdViewer.viewport.setZoomConstraints(null, null);
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
    }, [currentImage, serverUrl]);

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

    const handleFullPage = () => {
        if (osdViewerRef.current) {
            osdViewerRef.current.setFullScreen(!osdViewerRef.current.isFullPage());
        }
    };

    return (
        <div
            id="container"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
            }}
        >
            <div
                id="svsimage"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    id="openseadragon-viewer"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}
                >
                    <div id="control-bar" style={controlBarStyle}>
                        <ZoomInOutlined style={iconStyle} onClick={handleZoomIn} />
                        <ZoomOutOutlined style={iconStyle} onClick={handleZoomOut} />
                        <HomeOutlined style={iconStyle} onClick={handleHome} />
                        <FullscreenOutlined style={iconStyle} onClick={handleFullPage} />
                    </div>
                </div>
            </div>
        </div>
    );
}

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

export default ImageViewer;