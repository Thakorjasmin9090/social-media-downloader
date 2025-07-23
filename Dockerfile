FROM node:18 

pip3 install yt-dlp
RUN apt install -y ffmpeg && \ apt install -y libavcodec-extra

WORKDIR /app 


COPY . .

RUN npm install 

EXPOSE 3000

CMD ["node" , "start"]