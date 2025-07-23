# Multi-Platform Deployment Guide

## Current Issues Fixed:

### 1. **Internal Server Error on Render**
- **Cause**: Cleanup function failing at startup
- **Fix**: Added robust error handling and delayed cleanup execution
- **Status**: ✅ Fixed

### 2. **DNS Issues on Railway**
- **Cause**: Deployment configuration or domain issues
- **Fix**: Added Railway-specific configuration
- **Status**: ✅ Configuration added

## Platform-Specific Configurations:

### 🚀 **Render Deployment**

#### Files Used:
- `Dockerfile` - Container configuration
- `render.yaml` - Render-specific settings (if using Blueprint)
- `package.json` - Node.js dependencies and scripts

#### Deployment Steps:
1. **Connect Repository**: Link your GitHub repo to Render
2. **Service Type**: Web Service
3. **Build Command**: `docker build -t app .` (auto-detected)
4. **Start Command**: `npm start` (auto-detected)
5. **Environment**: Docker

#### Environment Variables (if needed):
```
NODE_ENV=production
PORT=10000
```

### 🚂 **Railway Deployment**

#### Files Used:
- `Dockerfile` - Container configuration
- `railway.json` - Railway-specific settings
- `package.json` - Node.js dependencies and scripts

#### Deployment Steps:
1. **Connect Repository**: Link your GitHub repo to Railway
2. **Deploy**: Railway auto-detects Dockerfile
3. **Domain**: Railway provides automatic domain
4. **Environment**: Docker

#### Railway Configuration (`railway.json`):
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

## 🔧 **Key Fixes Applied:**

### 1. **Robust Error Handling**
```javascript
// Downloads directory creation with error handling
try {
    fs.ensureDirSync(downloadsDir);
    console.log('Downloads directory created/verified:', downloadsDir);
} catch (error) {
    console.error('Failed to create downloads directory:', error.message);
}
```

### 2. **Delayed Cleanup Execution**
```javascript
// Wait 5 seconds before first cleanup to avoid startup issues
setTimeout(() => {
    cleanupOldFiles().catch(error => {
        console.error('Initial cleanup failed:', error.message);
    });
}, 5000);
```

### 3. **Graceful Shutdown Handling**
```javascript
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

### 4. **Enhanced yt-dlp Installation**
```dockerfile
# Install yt-dlp using pip
RUN python3 -m pip install --break-system-packages yt-dlp

# Verify yt-dlp installation
RUN python3 -m yt_dlp --version
```

## 📋 **Deployment Checklist:**

### Before Deployment:
- [ ] All files committed to Git repository
- [ ] `package.json` has correct start script
- [ ] `Dockerfile` builds successfully locally
- [ ] Environment variables configured (if needed)

### After Deployment:
- [ ] Check deployment logs for errors
- [ ] Test health endpoint: `/api/health`
- [ ] Test frontend loading at root URL
- [ ] Test video info API: `POST /api/info`
- [ ] Test download API: `POST /api/download`

## 🧪 **Testing Endpoints:**

### 1. **Health Check**
```bash
curl https://your-app-url.com/api/health
```
Expected: `{"success": true, "status": "healthy"}`

### 2. **Video Info**
```bash
curl -X POST https://your-app-url.com/api/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### 3. **Frontend**
Visit: `https://your-app-url.com`
Should load the social media downloader interface.

## 🐛 **Troubleshooting:**

### Render Issues:
1. **Build Fails**: Check Dockerfile syntax and dependencies
2. **Runtime Error**: Check application logs in Render dashboard
3. **Port Issues**: Ensure app listens on `process.env.PORT`

### Railway Issues:
1. **DNS Error**: Check if deployment completed successfully
2. **Domain Issues**: Use Railway-provided domain initially
3. **Build Issues**: Check Railway build logs

### Common Issues:
1. **yt-dlp Not Found**: Check if Python and pip are installed
2. **File Permissions**: Ensure downloads directory is writable
3. **Memory Issues**: Monitor resource usage on free tiers

## 📝 **Next Steps:**

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix deployment issues for Render and Railway"
   git push origin main
   ```

2. **Redeploy on Both Platforms**:
   - Render: Trigger manual deploy or push to connected branch
   - Railway: Push to trigger automatic deployment

3. **Monitor Logs**:
   - Watch for successful startup messages
   - Check for yt-dlp installation confirmation
   - Verify no error messages during startup

4. **Test Functionality**:
   - Test with a simple YouTube URL
   - Verify both video and audio downloads work
   - Check file cleanup functionality

---

**Both platforms should now deploy successfully with the enhanced error handling and platform-specific configurations!** 🎉