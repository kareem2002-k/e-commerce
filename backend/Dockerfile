# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and TypeScript config
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
