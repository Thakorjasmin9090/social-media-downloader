FROM node:18

RUN apt update && apt install -y python3 python3-pip && pip3 install --break-system-packages yt-dlp
RUN apt install -y ffmpeg && apt install -y libavcodec-extra

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy all files
COPY . .

# Create downloads directory
RUN mkdir -p downloads

EXPOSE 3000

CMD ["npm", "start"]