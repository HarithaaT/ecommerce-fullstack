# Use official Node.js 20 LTS image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Expose React default port
EXPOSE 3000

# Start React dev server
CMD ["npm", "start"]
