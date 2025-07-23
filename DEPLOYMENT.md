# Deployment Guide for Social Media Downloader

## Prerequisites

1. **Docker Desktop** (for containerized deployment)
2. **Node.js 18+** (for direct deployment)
3. **Python 3** with `yt-dlp` installed
4. **FFmpeg** for media processing

## Option 1: Docker Deployment (Recommended)

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your system.

### Step 2: Build the Docker Image
```bash
docker build -t social-media-downloader .
```

### Step 3: Run the Container
```bash
# Run on default port 3000
docker run -d -p 3000:3000 --name smd-app social-media-downloader

# Or run on custom port (e.g., 8080)
docker run -d -p 8080:3000 --name smd-app social-media-downloader
```

### Step 4: Check Container Status
```bash
docker ps
docker logs smd-app
```

### Step 5: Access the Application
- Open browser: `http://localhost:3000` (or your custom port)
- API Health Check: `http://localhost:3000/api/health`

### Docker Management Commands
```bash
# Stop the container
docker stop smd-app

# Start the container
docker start smd-app

# Remove the container
docker rm smd-app

# Remove the image
docker rmi social-media-downloader

# View logs
docker logs -f smd-app
```

## Option 2: Direct Node.js Deployment

### Step 1: Install System Dependencies

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y python3 python3-pip ffmpeg
pip3 install yt-dlp
```

**On Windows:**
```bash
# Install Python 3 and pip from python.org
# Install FFmpeg from https://ffmpeg.org/download.html
pip install yt-dlp
```

**On macOS:**
```bash
brew install python3 ffmpeg
pip3 install yt-dlp
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start

# Custom port
PORT=8080 npm start
```

## Option 3: Production Deployment with PM2

### Step 1: Install PM2
```bash
npm install -g pm2
```

### Step 2: Create PM2 Ecosystem File
```bash
# This creates ecosystem.config.js
pm2 init
```

### Step 3: Start with PM2
```bash
pm2 start server.js --name "social-media-downloader"

# Or with custom port
PORT=8080 pm2 start server.js --name "social-media-downloader"
```

### Step 4: PM2 Management
```bash
# View status
pm2 status

# View logs
pm2 logs social-media-downloader

# Restart
pm2 restart social-media-downloader

# Stop
pm2 stop social-media-downloader

# Delete
pm2 delete social-media-downloader

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Option 4: Cloud Deployment

### Heroku Deployment
1. Create `Procfile`:
```
web: npm start
```

2. Deploy commands:
```bash
heroku create your-app-name
git push heroku main
```

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables if needed
3. Deploy automatically

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build and run commands:
   - Build: `npm install`
   - Run: `npm start`

## Environment Variables

Create a `.env` file for configuration:
```env
PORT=3000
NODE_ENV=production
CLEANUP_INTERVAL=1800000
MAX_FILE_AGE=3600000
```

## Health Check Endpoints

- **Health Check**: `GET /api/health`
- **Supported Sites**: `GET /api/supported-sites`

## Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Use different port
   PORT=3001 npm start
   ```

2. **yt-dlp not found**:
   ```bash
   # Reinstall yt-dlp
   pip3 install --upgrade yt-dlp
   ```

3. **FFmpeg not found**:
   ```bash
   # Install FFmpeg
   sudo apt install ffmpeg  # Ubuntu/Debian
   brew install ffmpeg      # macOS
   ```

4. **Permission errors**:
   ```bash
   # Fix permissions
   chmod 755 downloads/
   ```

### Docker Troubleshooting:

1. **Docker daemon not running**:
   - Start Docker Desktop
   - Check: `docker version`

2. **Build fails**:
   ```bash
   # Clean build
   docker system prune -a
   docker build --no-cache -t social-media-downloader .
   ```

3. **Container won't start**:
   ```bash
   # Check logs
   docker logs smd-app
   
   # Run interactively
   docker run -it social-media-downloader /bin/bash
   ```

## Security Considerations

1. **Run as non-root user** (already configured in Dockerfile)
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Set up firewall rules**
5. **Regular security updates**

## Performance Optimization

1. **Use PM2 cluster mode**:
   ```bash
   pm2 start server.js -i max
   ```

2. **Enable gzip compression**
3. **Use reverse proxy** (Nginx)
4. **Monitor resource usage**

## Monitoring

1. **PM2 Monitoring**:
   ```bash
   pm2 monit
   ```

2. **Docker Stats**:
   ```bash
   docker stats smd-app
   ```

3. **Health Check Endpoint**:
   ```bash
   curl http://localhost:3000/api/health