# Dockerfile
FROM node:20-alpine

COPY . .

CMD ["npm", "start"]
