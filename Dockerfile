# Uses node 20 alpine image for apk package manager
FROM node:20-alpine

# Installs required system dependencies
RUN apk add --no-cache python3 make g++

# Sets the environment variable to point to Python
ENV PYTHON python3

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to the Docker environment
COPY package.json package-lock.json ./

# Installs required dependencies
RUN npm install

# Copies contents
COPY . .

# Builds the repo
RUN npm run build

# Exposes API port
EXPOSE 6969

# Stars the application
CMD npm run prod
