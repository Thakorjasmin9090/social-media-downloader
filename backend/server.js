const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the parent directory (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Create downloads directory
const downloadsDir = path.join(__dirname, 'downloads');
fs.ensureDirSync(downloadsDir);

// Clean up old files (older than 1 hour)
const cleanupOldFiles = () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    fs.readdir(downloadsDir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
            const filePath = path.join(downloadsDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                
                if (stats.mtime.getTime() < oneHourAgo) {
                    fs.unlink(filePath, () => {});
                }
            });
        });
    });
};

// Clean up every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

// Helper function to detect platform from URL
const detectPlatform = (url) => {
    const patterns = {
        youtube: /(?:youtube\.com|youtu\.be)/i,
        instagram: /instagram\.com/i,
        facebook: /facebook\.com|fb\.watch/i,
        tiktok: /tiktok\.com/i,
        twitter: /twitter\.com|x\.com/i,
        linkedin: /linkedin\.com/i
    };
    
    for (const [platform, pattern] of Object.entries(patterns)) {
        if (pattern.test(url)) {
            return platform;
        }
    }
    
    return 'unknown';
};

// Helper function to get video info
const getVideoInfo = async (url) => {
    try {
        const command = `yt-dlp --dump-json "${url}"`;
        const { stdout } = await execAsync(command);
        const info = JSON.parse(stdout);
        
        return {
            title: info.title || 'Unknown Title',
            thumbnail: info.thumbnail || '',
            duration: info.duration ? formatDuration(info.duration) : null,
            uploader: info.uploader || 'Unknown',
            view_count: info.view_count || 0,
            formats: info.formats || []
        };
    } catch (error) {
        console.error('Error getting video info:', error);
        throw new Error('Failed to get video information');
    }
};

// Helper function to format duration
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
};

// Helper function to generate unique filename
const generateFilename = (title, format) => {
    const sanitized = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const timestamp = Date.now();
    const extension = format === 'audio' ? 'mp3' : 'mp4';
    return `${sanitized}_${timestamp}.${extension}`;
};

// Helper function to get file size
const getFileSize = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        const bytes = stats.size;
        
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
        return 'Unknown';
    }
};

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// API endpoint to get video information
app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }
        
        const platform = detectPlatform(url);
        const info = await getVideoInfo(url);
        
        res.json({
            success: true,
            platform,
            ...info
        });
        
    } catch (error) {
        console.error('Info error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get video information'
        });
    }
});

// API endpoint to download content
app.post('/api/download', async (req, res) => {
    try {
        const { url, format = 'video', quality = 'best', platform } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }
        
        // Get video info first
        const info = await getVideoInfo(url);
        const filename = generateFilename(info.title, format);
        const outputPath = path.join(downloadsDir, filename);
        
        // Build yt-dlp command
        let command = 'yt-dlp';
        
        if (format === 'audio') {
            // Extract audio and convert to MP3
            command += ` --extract-audio --audio-format mp3`;
            
            if (quality !== 'best') {
                command += ` --audio-quality ${quality}`;
            }
        } else {
            // Download video
            if (quality === 'best') {
                command += ` -f "best[ext=mp4]"`;
            } else {
                command += ` -f "best[height<=${quality.replace('p', '')}][ext=mp4]"`;
            }
        }
        
        // Add output template
        command += ` -o "${outputPath}"`;
        
        // Add URL
        command += ` "${url}"`;
        
        console.log('Executing command:', command);
        
        // Execute download
        const { stdout, stderr } = await execAsync(command, {
            timeout: 300000 // 5 minutes timeout
        });
        
        // Check if file was created
        const actualFiles = fs.readdirSync(downloadsDir).filter(file => 
            file.startsWith(path.parse(filename).name)
        );
        
        if (actualFiles.length === 0) {
            throw new Error('Download failed - no file created');
        }
        
        const actualFilePath = path.join(downloadsDir, actualFiles[0]);
        const fileSize = getFileSize(actualFilePath);
        const downloadUrl = `/api/file/${actualFiles[0]}`;
        
        res.json({
            success: true,
            title: info.title,
            thumbnail: info.thumbnail,
            format: format,
            quality: quality,
            fileSize: fileSize,
            downloadUrl: downloadUrl,
            duration: info.duration,
            filename: actualFiles[0]
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Download failed'
        });
    }
});

// API endpoint to serve downloaded files
app.get('/api/file/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(downloadsDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }
        
        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        // Clean up file after download (optional)
        fileStream.on('end', () => {
            setTimeout(() => {
                fs.unlink(filePath, () => {});
            }, 60000); // Delete after 1 minute
        });
        
    } catch (error) {
        console.error('File serve error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to serve file'
        });
    }
});

// API endpoint to check supported sites
app.get('/api/supported-sites', async (req, res) => {
    try {
        const { stdout } = await execAsync('yt-dlp --list-extractors');
        const extractors = stdout.split('\n').filter(line => line.trim());
        
        res.json({
            success: true,
            count: extractors.length,
            extractors: extractors.slice(0, 50) // Return first 50 for demo
        });
        
    } catch (error) {
        console.error('Supported sites error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get supported sites'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Social Media Downloader Backend running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    
    // Initial cleanup
    cleanupOldFiles();
});

module.exports = app;

