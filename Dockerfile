# Dockerfile
FROM node:20-alpine

# Install required system dependencies
RUN apk add --no-cache python3 make g++

# Set environment variables to point to Python
ENV PYTHON python3

# Set the working directory
WORKDIR /usr/src/app

# Install required dependencies
RUN npm install node-cron node-fetch fs discord.js git node-pty typescript

# Copy contents
COPY . .

# Start application
CMD npm start
