# Dockerfile
FROM node:20-alpine

# Installs git
RUN apt-get update && apt-get install -y git

## Copies files to image
COPY . .

# Starts the service
CMD ["npm", "start"]
