# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy all source
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start command (Next dev mode)
CMD ["npm", "run", "dev"]
