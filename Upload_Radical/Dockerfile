FROM node:16
LABEL version="1.0"
LABEL description="This is the base docker image for the file server."

RUN mkdir -p /home/paff/upload-server

COPY . /home/paff/upload-server 

RUN cd /home/paff/upload-server && npm install

CMD ["node", "/home/paff/upload-server/server.js"]