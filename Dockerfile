FROM node:18-slim

# Install system dependencies including Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies
RUN npm install --production

# Install yt-dlp using multiple methods to ensure it works
RUN python3 -m pip install --break-system-packages yt-dlp && \
    pip3 install --break-system-packages yt-dlp && \
    ln -sf /usr/local/bin/yt-dlp /usr/bin/yt-dlp 2>/dev/null || true

# Verify yt-dlp installation with multiple paths
RUN python3 -m yt_dlp --version || yt-dlp --version || pip3 show yt-dlp

# Create a wrapper script to ensure yt-dlp is always accessible
RUN echo '#!/bin/bash\nif command -v yt-dlp >/dev/null 2>&1; then\n    yt-dlp "$@"\nelif command -v python3 >/dev/null 2>&1; then\n    python3 -m yt_dlp "$@"\nelse\n    echo "yt-dlp not found"\n    exit 1\nfi' > /usr/local/bin/yt-dlp-wrapper && \
    chmod +x /usr/local/bin/yt-dlp-wrapper

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