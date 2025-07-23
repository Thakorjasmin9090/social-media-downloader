FROM node:18

RUN apt update && apt install -y python3 python3-pip && pip3 install --break-system-packages yt-dlp
RUN apt install -y ffmpeg && apt install -y libavcodec-extra

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy public files to root level (where server.js expects them)
COPY public/* ./

# Copy server.js to backend directory
RUN mkdir -p backend
COPY server.js backend/
COPY README.md ./

# Set working directory to backend for running the server
WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]