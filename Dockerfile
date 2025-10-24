# Uses latest node alpine image
FROM node:alpine

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
