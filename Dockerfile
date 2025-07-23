FROM node:18-slim

# Install system dependencies including Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies
RUN npm install --production

# Install yt-dlp using pip
RUN python3 -m pip install --break-system-packages yt-dlp

# Verify yt-dlp installation
RUN python3 -m yt_dlp --version

# Copy application files
COPY . .

# Create downloads directory
RUN mkdir -p downloads

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]