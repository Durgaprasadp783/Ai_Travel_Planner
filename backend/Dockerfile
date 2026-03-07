# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy all backend source code
COPY . .

# Expose the API port
EXPOSE 5000

# Start command
CMD ["node", "app.js"]
