# Use official Node.js 20 LTS Alpine image (smaller size)
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend files
COPY . .

# Expose backend port
EXPOSE 5000

# Start server in development mode (with nodemon if available)
CMD ["npm", "run", "dev"]
