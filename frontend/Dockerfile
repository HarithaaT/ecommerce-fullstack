# Use Node 20 as base image
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port (React default 3000)
EXPOSE 3000

CMD ["npm", "start"]
