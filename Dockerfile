# Uses latest Node Alpine image
FROM node:alpine

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to the Docker environment
COPY package.json package-lock.json ./

# Installs required dependencies
RUN npm install

# Copies contents
COPY . .

# Exposes API port
EXPOSE 6969

# Stars the application
CMD npm start
