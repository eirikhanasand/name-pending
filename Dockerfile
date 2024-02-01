# Dockerfile
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

RUN npm install node-cron node-fetch fs

COPY . .

CMD npm start
