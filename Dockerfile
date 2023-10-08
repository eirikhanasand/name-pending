# Dockerfile
FROM node:20-alpine

## Copies files to image
COPY . .

# Starts the service
CMD ["npm", "start"]
