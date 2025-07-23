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

// Serve static files from the public directory (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Create downloads directory with error handling
const downloadsDir = path.join(__dirname, 'downloads');
try {
    fs.ensureDirSync(downloadsDir);
    console.log('Downloads directory created/verified:', downloadsDir);
} catch (error) {
    console.error('Failed to create downloads directory:', error.message);
    // Continue without failing - directory might be created later
}

// Clean up old files (older than 1 hour)
const cleanupOldFiles = async () => {
    try {
        // Ensure downloads directory exists first
        await fs.ensureDir(downloadsDir);
        
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        let cleanedCount = 0;
        let errorCount = 0;
        
        // Read directory contents
        const files = await fs.readdir(downloadsDir);
        
        if (files.length === 0) {
            console.log('Cleanup: No files to process');
            return;
        }
        
        console.log(`Cleanup: Processing ${files.length} files`);
        
        // Process files in parallel with concurrency limit
        const BATCH_SIZE = 10; // Process 10 files at a time
        const batches = [];
        
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            batches.push(files.slice(i, i + BATCH_SIZE));
        }
        
        for (const batch of batches) {
            const promises = batch.map(async (file) => {
                const filePath = path.join(downloadsDir, file);
                
                try {
                    // Get file stats
                    const stats = await fs.stat(filePath);
                    
                    // Check if file is older than threshold
                    if (stats.mtime.getTime() < oneHourAgo) {
                        await fs.unlink(filePath);
                        cleanedCount++;
                        console.log(`Cleanup: Removed old file - ${file}`);
                    }
                } catch (error) {
                    errorCount++;
                    // Log specific errors but don't stop the cleanup process
                    if (error.code === 'ENOENT') {
                        console.log(`Cleanup: File already deleted - ${file}`);
                    } else {
                        console.error(`Cleanup: Error processing ${file}:`, error.message);
                    }
                }
            });
            
            // Wait for current batch to complete before processing next batch
            await Promise.allSettled(promises);
        }
        
        console.log(`Cleanup completed: ${cleanedCount} files removed, ${errorCount} errors`);
        
    } catch (error) {
        console.error('Cleanup: Failed to read downloads directory:', error.message);
        // Don't throw error - just log it
    }
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
        // Try different yt-dlp paths
        const ytdlpPaths = [
            'yt-dlp',
            '/usr/local/bin/yt-dlp',
            '/usr/bin/yt-dlp',
            'python3 -m yt_dlp'
        ];
        
        let command = null;
        let lastError = null;
        
        // Test which yt-dlp path works
        for (const ytdlpPath of ytdlpPaths) {
            try {
                await execAsync(`${ytdlpPath} --version`, { timeout: 5000 });
                command = `${ytdlpPath} --dump-json "${url}"`;
                console.log(`Using yt-dlp path: ${ytdlpPath}`);
                break;
            } catch (err) {
                lastError = err;
                console.log(`Failed to use ${ytdlpPath}:`, err.message);
                continue;
            }
        }
        
        if (!command) {
            console.error('yt-dlp not found in any expected location');
            throw new Error('yt-dlp is not installed or not accessible. Please check the deployment configuration.');
        }
        
        console.log('Executing command:', command);
        const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
        
        if (stderr) {
            console.log('yt-dlp stderr:', stderr);
        }
        
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
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            signal: error.signal
        });
        
        if (error.message.includes('yt-dlp')) {
            throw new Error('yt-dlp is not properly installed. Please redeploy the application.');
        } else if (error.code === 'ETIMEDOUT') {
            throw new Error('Request timed out. The video might be too large or the server is busy.');
        } else if (error.message.includes('Unsupported URL')) {
            throw new Error('This URL is not supported. Please check the URL and try again.');
        } else {
            throw new Error('Failed to get video information. Please check the URL and try again.');
        }
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
        
        // Find working yt-dlp path (same as in getVideoInfo)
        const ytdlpPaths = [
            'yt-dlp',
            '/usr/local/bin/yt-dlp',
            '/usr/bin/yt-dlp',
            'python3 -m yt_dlp'
        ];
        
        let ytdlpCommand = null;
        
        for (const ytdlpPath of ytdlpPaths) {
            try {
                await execAsync(`${ytdlpPath} --version`, { timeout: 5000 });
                ytdlpCommand = ytdlpPath;
                console.log(`Using yt-dlp path for download: ${ytdlpPath}`);
                break;
            } catch (err) {
                continue;
            }
        }
        
        if (!ytdlpCommand) {
            throw new Error('yt-dlp is not installed or not accessible');
        }
        
        // Build yt-dlp command
        let command = ytdlpCommand;
        
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
        const allFiles = await fs.readdir(downloadsDir);
        const actualFiles = allFiles.filter(file =>
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
app.get('/api/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(downloadsDir, filename);
        
        try {
            await fs.access(filePath);
        } catch (error) {
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
            setTimeout(async () => {
                try {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up downloaded file: ${filename}`);
                } catch (error) {
                    console.error(`Failed to cleanup file ${filename}:`, error.message);
                }
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
        // Find working yt-dlp path
        const ytdlpPaths = [
            'yt-dlp',
            '/usr/local/bin/yt-dlp',
            '/usr/bin/yt-dlp',
            'python3 -m yt_dlp'
        ];
        
        let ytdlpCommand = null;
        
        for (const ytdlpPath of ytdlpPaths) {
            try {
                await execAsync(`${ytdlpPath} --version`, { timeout: 5000 });
                ytdlpCommand = ytdlpPath;
                break;
            } catch (err) {
                continue;
            }
        }
        
        if (!ytdlpCommand) {
            throw new Error('yt-dlp is not installed or not accessible');
        }
        
        const { stdout } = await execAsync(`${ytdlpCommand} --list-extractors`);
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

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Social Media Downloader Backend running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    
    // Initial cleanup with error handling - run after a delay
    setTimeout(() => {
        cleanupOldFiles().catch(error => {
            console.error('Initial cleanup failed:', error.message);
        });
    }, 5000); // Wait 5 seconds before first cleanup
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;

