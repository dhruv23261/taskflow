# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 5000

# Start command (migrations + server)
# In production, we using a shell script to handle migrations and startup
CMD ["sh", "-c", "npm run migrate:up && npm start"]
