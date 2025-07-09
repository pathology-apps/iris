# Iris Image Viewer Frontend

A modern, responsive frontend for viewing high-resolution iris images with advanced zoom and pan capabilities.

## Features

### Landing Page (`/landing`)
- **Modern Design**: Beautiful gradient background with glass-morphism effects
- **Feature Highlights**: Showcases key capabilities with animated cards
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Quick Access**: Direct links to sample image viewer and main application

### Demo Image Viewer (`/demo-viewer`)
- **Interactive Controls**: Zoom in/out, reset view, fullscreen toggle
- **Real-time Feedback**: Shows current zoom level and image information
- **Professional Interface**: Dark theme optimized for image viewing
- **Placeholder Content**: Demonstrates the viewer interface with sample data

### Full Image Viewer (`/view-image`)
- **OpenSeadragon Integration**: High-performance image viewing with tiling
- **Iris Format Support**: Native support for .iris image files
- **Advanced Controls**: Professional-grade viewing tools
- **Authentication Required**: Secure access to actual image collections

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Ant Design**: Professional UI components and icons
- **OpenSeadragon**: High-performance image viewing library
- **React Router**: Client-side routing and navigation
- **CSS-in-JS**: Inline styles for component-specific styling

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation
```bash
cd client
npm install
```

### Development
```bash
npm run local
```

### Building for Production
```bash
npm run build
```

## Usage

### Accessing the Landing Page
Navigate to `/landing` to see the main landing page with:
- Feature overview
- Quick access buttons
- Professional presentation

### Using the Demo Viewer
1. Click "View Sample Image" on the landing page
2. Use the control bar to:
   - Zoom in/out with the +/- buttons
   - Reset view with the home button
   - Toggle fullscreen mode
   - Close the viewer

### Using the Full Viewer
1. Navigate to the main application
2. Browse collections or study sets
3. Click on any image to open the full viewer
4. Use OpenSeadragon controls for advanced viewing

## File Structure

```
client/src/views/
├── LandingPage.js      # Main landing page component
├── DemoViewer.js       # Demo image viewer
├── ImageViewer.js      # Full OpenSeadragon viewer
└── IrisTileSource.js   # Custom tile source for iris images
```

## Customization

### Styling
All components use inline styles for easy customization. Key style variables:
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Accent color: `#ffdc00` (University of Michigan yellow)
- Text colors: White and semi-transparent white variants

### Adding New Features
1. Create new components in `client/src/views/`
2. Add routes to `AppComponent.js`
3. Import and use Ant Design components for consistency

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading of components
- Optimized image tiling with OpenSeadragon
- Efficient state management with React hooks
- Minimal bundle size with tree shaking

## Security

- Authentication required for full image access
- Demo viewer available without authentication
- Secure routing with protected routes
- Input validation and sanitization

## Contributing

1. Follow the existing code style
2. Use Ant Design components for consistency
3. Add proper error handling
4. Test on multiple browsers
5. Update documentation as needed

## License

This project is part of the Iris Image Viewer system and follows the same licensing terms. 