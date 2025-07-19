# Project Structure

```
social-media-downloader/
├── README.md                 # Main project documentation
├── index.html               # Main frontend page
├── css/
│   └── style.css            # Main stylesheet
├── js/
│   └── script.js            # Frontend JavaScript
├── images/                  # Image assets (empty)
├── assets/                  # Additional assets (empty)
└── backend/
    ├── server.js            # Main Node.js server
    ├── package.json         # Node.js dependencies
    ├── README.md            # Backend documentation
    ├── install.sh           # Installation script
    ├── downloads/           # Temporary download directory
    └── node_modules/        # Node.js modules (after npm install)
```

## File Descriptions

### Frontend Files

- **index.html**: Main HTML page with complete UI
- **css/style.css**: Comprehensive CSS with responsive design
- **js/script.js**: JavaScript for frontend functionality and API calls

### Backend Files

- **server.js**: Express.js server with yt-dlp integration
- **package.json**: Node.js project configuration and dependencies
- **install.sh**: Automated installation script
- **README.md**: Backend-specific documentation

### Configuration Files

- **package.json**: Defines Node.js dependencies and scripts
- **README.md**: Complete project documentation

### Directories

- **downloads/**: Temporary storage for downloaded files (auto-cleanup)
- **node_modules/**: Node.js dependencies (created after npm install)
- **css/**: Stylesheets and design assets
- **js/**: JavaScript files and frontend logic
- **images/**: Image assets and media files
- **assets/**: Additional project assets

## Key Features by File

### index.html
- Responsive layout
- Platform selection interface
- Download form with quality options
- FAQ section
- Contact form
- Modal system for results

### style.css
- Modern CSS with CSS Grid and Flexbox
- Responsive design for all devices
- Smooth animations and transitions
- Custom color scheme and typography
- Interactive elements styling

### script.js
- URL validation and platform detection
- API communication with backend
- Modal management
- Form handling and user interactions
- Error handling and user feedback

### server.js
- Express.js REST API
- yt-dlp integration for downloads
- File management and cleanup
- CORS configuration
- Error handling and logging

## Dependencies

### Frontend
- Font Awesome (icons)
- Google Fonts (Inter, JetBrains Mono)
- Modern CSS features

### Backend
- express: Web framework
- cors: Cross-origin resource sharing
- fs-extra: Enhanced file system operations
- node-fetch: HTTP client
- yt-dlp: Video/audio downloader (Python package)

## Installation Order

1. Extract/clone project files
2. Navigate to backend directory
3. Run installation script: `./install.sh`
4. Start server: `./start.sh`
5. Access via browser: `http://localhost:3000`

