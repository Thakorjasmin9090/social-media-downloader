# SocialDownloader - Universal Social Media Content Downloader

A comprehensive web application for downloading videos, photos, and reels from multiple social media platforms with audio conversion capabilities and HD quality downloads.

![SocialDownloader](https://via.placeholder.com/800x400/2563EB/FFFFFF?text=SocialDownloader)

## 🚀 Features

- **Multi-Platform Support**: Download from YouTube, Instagram, Facebook, TikTok, Twitter, LinkedIn, Pinterest, Vimeo, and 1000+ other sites
- **Format Options**: Download as video (MP4) or convert to audio (MP3)
- **Quality Selection**: Choose from 360p to 4K for videos, 128kbps to 320kbps for audio
- **No Watermarks**: Clean downloads without platform watermarks
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Fast Processing**: Optimized download algorithms for speed
- **No Registration**: Use immediately without creating accounts
- **Privacy Focused**: No data stored, completely anonymous
- **Modern UI**: Beautiful, intuitive interface with smooth animations

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Supported Platforms](#supported-platforms)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Legal Notice](#legal-notice)

## 🛠 Installation

### Prerequisites

- **Node.js** 14.0.0 or higher
- **Python** 3.6+ (for yt-dlp)
- **npm** or **yarn**

### Quick Start

1. **Clone or extract the project**:
```bash
cd social-media-downloader
```

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Install yt-dlp**:
```bash
pip install yt-dlp
```

4. **Start the server**:
```bash
npm start
```

5. **Open your browser** and navigate to:
```
http://localhost:3000
```

## 🎯 Usage

### Web Interface

1. **Paste URL**: Copy the link of the video or photo you want to download
2. **Select Platform**: The platform will be auto-detected, or you can manually select it
3. **Choose Format**: Select video (MP4) or audio (MP3)
4. **Select Quality**: Choose your preferred quality
5. **Download**: Click the download button and get your file instantly

### Supported URL Examples

```
YouTube: https://www.youtube.com/watch?v=VIDEO_ID
Instagram: https://www.instagram.com/p/POST_ID/
Facebook: https://www.facebook.com/watch/?v=VIDEO_ID
TikTok: https://www.tiktok.com/@user/video/VIDEO_ID
Twitter: https://twitter.com/user/status/TWEET_ID
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### POST /api/download
Download media from a URL.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format": "video",
  "quality": "720p",
  "platform": "youtube"
}
```

**Response:**
```json
{
  "success": true,
  "title": "Video Title",
  "thumbnail": "https://thumbnail-url.jpg",
  "format": "video",
  "quality": "720p",
  "fileSize": "25.8 MB",
  "downloadUrl": "/api/file/filename.mp4",
  "duration": "3:45"
}
```

#### POST /api/info
Get information about a video/media.

#### GET /api/file/:filename
Download the processed file.

#### GET /api/health
Health check endpoint.

## 🌐 Supported Platforms

| Platform | Videos | Photos | Audio | Notes |
|----------|--------|--------|-------|-------|
| YouTube | ✅ | ❌ | ✅ | Shorts, Music |
| Instagram | ✅ | ✅ | ✅ | Posts, Stories, Reels, IGTV |
| Facebook | ✅ | ✅ | ✅ | Videos, Photos, Stories |
| TikTok | ✅ | ❌ | ✅ | No watermark |
| Twitter/X | ✅ | ✅ | ✅ | Videos, GIFs, Photos |
| LinkedIn | ✅ | ✅ | ✅ | Professional content |
| Pinterest | ✅ | ✅ | ✅ | Images, Videos |
| Vimeo | ✅ | ❌ | ✅ | HD Videos |

*And 1000+ more sites supported by yt-dlp*

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=100MB
CLEANUP_INTERVAL=30
```

### Server Configuration

Edit `backend/server.js` to customize:

- Port settings
- CORS configuration
- File cleanup intervals
- Download timeouts
- Quality options

## 🚀 Deployment

### Local Development
```bash
cd backend
npm start
```

### Production Deployment

#### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name "social-downloader"
pm2 startup
pm2 save
```

#### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN pip install yt-dlp
EXPOSE 3000
CMD ["npm", "start"]
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. YouTube "Sign in to confirm you're not a bot"
**Solution**: This is due to YouTube's anti-bot measures. To fix:

```bash
# Install browser cookies support
pip install browser-cookie3

# Or use cookies from browser
yt-dlp --cookies-from-browser chrome "URL"
```

#### 2. Download fails with 403/404 errors
**Causes**:
- URL is private or restricted
- Platform requires authentication
- Geographic restrictions

**Solutions**:
- Ensure URL is publicly accessible
- Try different quality settings
- Check if content is age-restricted

#### 3. Server won't start
**Check**:
- Node.js version (14.0.0+)
- Port availability (3000)
- yt-dlp installation
- Dependencies installation

#### 4. Slow downloads
**Optimization**:
- Choose lower quality for faster downloads
- Check internet connection
- Ensure sufficient disk space

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm start
```

### Logs Location
- Application logs: Console output
- Download logs: `backend/downloads/` directory
- Error logs: Browser console (F12)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Add tests for new features
- Update documentation
- Ensure cross-platform compatibility

## 📄 Legal Notice

**Important**: This tool is for educational and personal use only.

- ✅ Download your own content
- ✅ Download public domain content
- ✅ Download with explicit permission
- ❌ Download copyrighted content without permission
- ❌ Redistribute downloaded content
- ❌ Use for commercial purposes without proper licensing

Users are responsible for complying with:
- Platform terms of service
- Copyright laws
- Local regulations
- Content creator rights

## 📞 Support

- **Documentation**: Check this README and backend/README.md
- **Issues**: Report bugs via GitHub issues
- **Questions**: Check the FAQ section
- **Updates**: Follow the repository for updates

## 🔄 Updates

### Version 1.0.0 (Current)
- Initial release
- Multi-platform support
- Video/audio conversion
- Responsive design
- REST API

### Planned Features
- Batch downloads
- Download history
- Cloud storage integration
- Browser extension
- Mobile app

## 📊 Performance

- **Average download speed**: Depends on source and quality
- **Supported file sizes**: Up to 2GB per file
- **Concurrent downloads**: 5 per IP
- **Cleanup interval**: 30 minutes
- **File retention**: 1 hour after download

## 🔒 Privacy & Security

- **No data collection**: URLs and files are not stored
- **Automatic cleanup**: Files deleted after download
- **No tracking**: No analytics or user tracking
- **HTTPS ready**: SSL/TLS support for secure connections
- **Input validation**: All inputs are sanitized

---

**Made with ❤️ for the community**

*Star ⭐ this repository if you find it useful!*

#   N e x - y t  
 # Nex-yt
