# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy source files for runtime
COPY . .

# Stage 2: Minimal runtime image
FROM node:18-alpine

WORKDIR /app

# Copy only runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

# Run database migrations, seed demo data, then start the server
CMD ["sh", "-c", "npm run migrate:up && npm run seed && npm start"]
