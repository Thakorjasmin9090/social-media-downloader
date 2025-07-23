FROM node:18 

RUN apt update && apt install -y 
python3 python3-pip && pip3 install yt-dlp


WORKDIR / app 

COPY . .

RUN npm install 

EXPOSE 3000

CMD ["node" , "server.js"]