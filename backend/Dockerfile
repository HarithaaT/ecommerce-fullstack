# Use Node 20 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Expose port (adjust if your backend uses another)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
