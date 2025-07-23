// Alternative Implementation 1: Functional Programming Approach
const cleanupOldFilesFunctional = async () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    try {
        const files = await fs.readdir(downloadsDir);
        
        const fileOperations = files.map(async (file) => {
            const filePath = path.join(downloadsDir, file);
            
            try {
                const stats = await fs.stat(filePath);
                const isOld = stats.mtime.getTime() < oneHourAgo;
                
                return isOld ? { file, action: 'delete', path: filePath } : null;
            } catch (error) {
                return { file, action: 'error', error: error.message };
            }
        });
        
        const results = await Promise.allSettled(fileOperations);
        const filesToDelete = results
            .filter(result => result.status === 'fulfilled' && result.value?.action === 'delete')
            .map(result => result.value);
        
        // Delete files in parallel
        const deleteOperations = filesToDelete.map(async ({ file, path: filePath }) => {
            try {
                await fs.unlink(filePath);
                return { file, status: 'deleted' };
            } catch (error) {
                return { file, status: 'error', error: error.message };
            }
        });
        
        const deleteResults = await Promise.allSettled(deleteOperations);
        const successCount = deleteResults.filter(r => r.status === 'fulfilled' && r.value.status === 'deleted').length;
        
        console.log(`Cleanup: ${successCount} files deleted out of ${files.length} processed`);
        
    } catch (error) {
        console.error('Cleanup failed:', error.message);
    }
};

// Alternative Implementation 2: Stream-based Approach (for large directories)
const { pipeline } = require('stream/promises');
const { Readable, Transform, Writable } = require('stream');

const cleanupOldFilesStream = async () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let processedCount = 0;
    let deletedCount = 0;
    
    try {
        const files = await fs.readdir(downloadsDir);
        
        const fileStream = Readable.from(files);
        
        const processTransform = new Transform({
            objectMode: true,
            async transform(file, encoding, callback) {
                const filePath = path.join(downloadsDir, file);
                
                try {
                    const stats = await fs.stat(filePath);
                    processedCount++;
                    
                    if (stats.mtime.getTime() < oneHourAgo) {
                        this.push({ file, filePath, shouldDelete: true });
                    }
                } catch (error) {
                    console.error(`Error processing ${file}:`, error.message);
                }
                
                callback();
            }
        });
        
        const deleteWritable = new Writable({
            objectMode: true,
            async write({ file, filePath, shouldDelete }, encoding, callback) {
                if (shouldDelete) {
                    try {
                        await fs.unlink(filePath);
                        deletedCount++;
                        console.log(`Deleted: ${file}`);
                    } catch (error) {
                        console.error(`Failed to delete ${file}:`, error.message);
                    }
                }
                callback();
            }
        });
        
        await pipeline(fileStream, processTransform, deleteWritable);
        
        console.log(`Stream cleanup: ${deletedCount} files deleted, ${processedCount} files processed`);
        
    } catch (error) {
        console.error('Stream cleanup failed:', error.message);
    }
};

// Alternative Implementation 3: Class-based Approach with Configuration
class FileCleanupManager {
    constructor(options = {}) {
        this.downloadsDir = options.downloadsDir || path.join(__dirname, 'downloads');
        this.maxAge = options.maxAge || (60 * 60 * 1000); // 1 hour default
        this.batchSize = options.batchSize || 10;
        this.logLevel = options.logLevel || 'info';
    }
    
    log(level, message) {
        if (this.logLevel === 'debug' || (this.logLevel === 'info' && level !== 'debug')) {
            console.log(`[${level.toUpperCase()}] ${message}`);
        }
    }
    
    async cleanup() {
        const cutoffTime = Date.now() - this.maxAge;
        const stats = { processed: 0, deleted: 0, errors: 0 };
        
        try {
            const files = await fs.readdir(this.downloadsDir);
            this.log('info', `Starting cleanup of ${files.length} files`);
            
            // Process in batches
            for (let i = 0; i < files.length; i += this.batchSize) {
                const batch = files.slice(i, i + this.batchSize);
                await this.processBatch(batch, cutoffTime, stats);
            }
            
            this.log('info', `Cleanup completed: ${stats.deleted} deleted, ${stats.errors} errors`);
            return stats;
            
        } catch (error) {
            this.log('error', `Cleanup failed: ${error.message}`);
            throw error;
        }
    }
    
    async processBatch(files, cutoffTime, stats) {
        const promises = files.map(file => this.processFile(file, cutoffTime, stats));
        await Promise.allSettled(promises);
    }
    
    async processFile(file, cutoffTime, stats) {
        const filePath = path.join(this.downloadsDir, file);
        
        try {
            const fileStats = await fs.stat(filePath);
            stats.processed++;
            
            if (fileStats.mtime.getTime() < cutoffTime) {
                await fs.unlink(filePath);
                stats.deleted++;
                this.log('debug', `Deleted old file: ${file}`);
            }
            
        } catch (error) {
            stats.errors++;
            if (error.code !== 'ENOENT') {
                this.log('error', `Error processing ${file}: ${error.message}`);
            }
        }
    }
}

// Usage example:
// const cleanupManager = new FileCleanupManager({
//     maxAge: 2 * 60 * 60 * 1000, // 2 hours
//     batchSize: 15,
//     logLevel: 'debug'
// });
// await cleanupManager.cleanup();

module.exports = {
    cleanupOldFilesFunctional,
    cleanupOldFilesStream,
    FileCleanupManager
};