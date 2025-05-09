# Use Debian-based Node.js image (NOT Alpine)
FROM node:22

# Install required build tools for bcrypt native bindings
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy full project into container
COPY . .

# Install global tools
RUN npm install -g pnpm ts-node typescript

# Change into backend directory where the actual code lives
WORKDIR /app/backend

# Install backend dependencies
RUN pnpm install

# Rebuild bcrypt native bindings
RUN pnpm rebuild bcrypt

# Expose the backend port
EXPOSE 3002

# Start the app using ts-node
CMD ["pnpm", "run", "start-ts"]
