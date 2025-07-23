# Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)

## Deployment Steps

### Method 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** with all the files including `render.yaml`

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Deploy**:
   - Click "Apply" to deploy
   - Render will automatically install dependencies and start your app

### Method 2: Manual Web Service Setup

1. **Create New Web Service**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings**:
   ```
   Name: social-media-downloader
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**:
   ```
   NODE_ENV=production
   ```

4. **Advanced Settings**:
   - Health Check Path: `/api/health`
   - Auto-Deploy: Yes

## Important Configuration

### Build Command
```bash
npm install
```

### Start Command
```bash
npm start
```

### Environment Variables
- `NODE_ENV=production` (automatically set by Render)
- `PORT` (automatically provided by Render)

## System Dependencies

Render automatically provides:
- ✅ Node.js 18.x
- ✅ Python 3
- ✅ pip
- ✅ FFmpeg
- ✅ Basic system tools

The app will automatically install `yt-dlp` during the build process.

## Health Check

Your app includes a health check endpoint at `/api/health` that Render will use to monitor your service.

## File Storage

**Important**: Render's free tier has ephemeral storage, meaning downloaded files will be deleted when the service restarts. For persistent storage, consider:

1. **Render Disks** (paid feature)
2. **External storage** (AWS S3, Cloudinary, etc.)
3. **Temporary downloads** (current setup - files auto-delete after 1 hour)

## Deployment Checklist

- ✅ All dependencies in `package.json`
- ✅ Correct Node.js version specified (`18.x`)
- ✅ Health check endpoint (`/api/health`)
- ✅ Environment variables configured
- ✅ Build and start commands set
- ✅ Error handling implemented
- ✅ Async operations properly handled

## Expected Build Process

1. **Install system dependencies** (Python, FFmpeg, etc.)
2. **Install yt-dlp** via pip
3. **Install Node.js dependencies** via npm
4. **Start the application** on Render's assigned port

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Won't Start
- Check application logs
- Verify start command is `npm start`
- Ensure health check endpoint is working

### yt-dlp Issues
- yt-dlp is installed during build process
- Check if Python 3 and pip are available
- Verify yt-dlp installation in build logs

### Port Issues
- Don't hardcode port 3000
- Use `process.env.PORT || 3000`
- Render automatically assigns the port

## Performance Tips

1. **Use npm ci** for faster installs (already configured)
2. **Enable health checks** for better monitoring
3. **Implement proper error handling** (already done)
4. **Use async/await** consistently (already implemented)

## Security

- ✅ Non-root user execution
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration
- ✅ No hardcoded secrets

## Monitoring

- Use Render's built-in monitoring
- Check `/api/health` endpoint
- Monitor application logs
- Set up alerts for downtime

## Scaling

For high traffic:
1. Upgrade to paid Render plan
2. Enable auto-scaling
3. Use external storage for files
4. Implement caching strategies

Your application is now ready for deployment on Render with zero configuration needed!