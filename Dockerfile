# Dockerfile
FROM node:20-alpine

# Install required system dependencies
RUN apk add --no-cache python3 make g++

# Set environment variables to point to Python
ENV PYTHON python3
# ENV GOOGLE_APPLICATION_CREDENTIALS /usr/src/app/secrets/.secrets.json

# Set the working directory
WORKDIR /usr/src/app

# Install required dependencies
RUN npm install node-cron node-fetch fs discord.js git node-pty typescript firebase-admin

# Copy contents
COPY . .

# Start application
CMD npm start

# {
#     type: TYPE,
#     project_id: PROJECT_ID,
#     private_key_id: PRIVATE_KEY_ID,
#     private_key: PRIVATE_KEY,
#     client_email: CLIENT_EMAIL,
#     client_id: CLIENT_ID,
#     auth_uri: AUTH_URI,
#     token_uri: TOKEN_URI,
#     auth_provider_x509_cert_url: AUTH_CERT_URL,
#     client_x509_cert_url: CLIENT_CERT_URL,
#     universe_domain: UNIVERSE_DOMAIN
# }