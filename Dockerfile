FROM node:18 

RUN apt update && apt install -y python3 python3-pip && pip3 install --break-system-packages yt-dlp
RUN apt install -y ffmpeg && apt install -y libavcodec-extra

WORKDIR /app 

COPY . .

RUN npm install 

EXPOSE 3000

CMD ["npm", "start"]