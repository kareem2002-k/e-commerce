# Use Node.js 22 base image
FROM node:22

# Set working directory to /app
WORKDIR /app

# Copy all project files to container
COPY . .

# Set production environment variable
ENV NODE_ENV=production

# Install global dev tools
RUN npm install -g pnpm ts-node typescript

# Install root-level dependencies (if any)
RUN pnpm install

# Move into backend directory
WORKDIR /app/backend

# Install backend-specific dependencies
RUN pnpm install

# Expose the port your backend runs on
EXPOSE 3002

# Start the app using ts-node
CMD ["pnpm", "run", "start-ts"]
