# Social Media Downloader Backend

A Node.js backend server for downloading videos, photos, and audio from various social media platforms using yt-dlp.

## Features

- Download videos from YouTube, Instagram, Facebook, TikTok, Twitter, LinkedIn, and more
- Convert videos to MP3 audio format
- Multiple quality options (360p to 4K for video, 128kbps to 320kbps for audio)
- Automatic file cleanup
- RESTful API endpoints
- CORS enabled for frontend integration

## Prerequisites

- Node.js 14.0.0 or higher
- Python 3.6+ (for yt-dlp)
- yt-dlp installed (`pip install yt-dlp`)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install yt-dlp:
```bash
pip install yt-dlp
```

## Usage

### Development
```bash
npm start
```

The server will start on port 3000 (or the port specified in the PORT environment variable).

### API Endpoints

#### GET /
Serves the frontend application.

#### POST /api/info
Get information about a video/media from a URL.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "youtube",
  "title": "Video Title",
  "thumbnail": "https://thumbnail-url.jpg",
  "duration": "3:45",
  "uploader": "Channel Name",
  "view_count": 1000000
}
```

#### POST /api/download
Download media from a URL.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format": "video", // or "audio"
  "quality": "720p", // or "best", "1080p", "480p", "360p" for video; "320kbps", "256kbps", "192kbps", "128kbps" for audio
  "platform": "youtube" // optional, auto-detected
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
  "duration": "3:45",
  "filename": "filename.mp4"
}
```

#### GET /api/file/:filename
Download the processed file.

#### GET /api/supported-sites
Get a list of supported sites/extractors.

#### GET /api/health
Health check endpoint.

## Supported Platforms

- YouTube (videos, shorts, music)
- Instagram (posts, stories, reels, IGTV)
- Facebook (videos, photos, stories)
- TikTok (videos, no watermark)
- Twitter/X (videos, GIFs, photos)
- LinkedIn (videos, posts)
- Pinterest (images, videos)
- Vimeo (HD videos)
- And many more (1000+ sites supported by yt-dlp)

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### File Management

- Downloaded files are stored in the `downloads/` directory
- Files older than 1 hour are automatically cleaned up every 30 minutes
- Files are also deleted 1 minute after being downloaded

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request (missing or invalid parameters)
- 404: Not Found (file or endpoint not found)
- 500: Internal Server Error (download failed, server error)

## Security Considerations

- CORS is enabled for all origins (configure as needed for production)
- File cleanup prevents disk space issues
- Timeout protection for long downloads (5 minutes)
- Input validation for URLs and parameters

## Deployment

For production deployment:

1. Set appropriate environment variables
2. Configure CORS for your domain
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL/TLS
5. Set up process manager (PM2)

## Legal Notice

This tool is for educational and personal use only. Users are responsible for complying with the terms of service of the platforms they download content from and applicable copyright laws.

## Troubleshooting

### Common Issues

1. **yt-dlp not found**: Ensure yt-dlp is installed and in PATH
2. **Download fails**: Check if the URL is valid and publicly accessible
3. **Permission errors**: Ensure write permissions for the downloads directory
4. **Timeout errors**: Large files may take longer; adjust timeout as needed

### Logs

Check console output for detailed error messages and download progress.

