FROM node:16
LABEL version="1.0"
LABEL description="This is the base docker image for the PAFF backend API."

RUN mkdir -p /home/paff/paff_backend

RUN ls
COPY . /home/paff/paff_backend 

RUN cd /home/paff/paff_backend && npm install

CMD ["node", "/home/paff/paff_backend/app.js"]
