FROM node:18

# Create app directory
WORKDIR /home/openbackhaul/backupAndRestore

#Proxy config
ARG HTTP_PROXY
ARG HTTPS_PROXY

ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY

# Bundle app source
COPY . .

# Install npm packages for client & Create build for react application
RUN cd ./client && npm ci && npm run build

# Install npm packages for server
RUN cd ./server && npm ci --only=production

EXPOSE 4054

# Command to start the application
CMD ["sh", "-c", "cd ./server && node index.js"]