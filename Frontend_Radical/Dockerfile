FROM node:16
LABEL version="1.0"
LABEL description="This is the base docker image for the PAFF Frontend."

RUN mkdir -p /home/paff/paff_frontend

COPY . /home/paff/paff_frontend 

RUN cd /home/paff/paff_frontend && npm install --legacy-peer-deps && npm run build

WORKDIR /home/paff/paff_frontend

CMD ["npm", "run", "start"]
