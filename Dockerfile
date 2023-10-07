# Dockerfile
FROM node:14-alpine

RUN npm install discord.js fs

COPY . .

CMD ["node", "npm run start"]
