FROM node:22

# Install build tools required for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy entire project
COPY . .

# Install global dev tools
RUN npm install -g pnpm ts-node typescript

# Install all dependencies (including bcrypt)
RUN pnpm install

# Move into backend folder (assuming package.json is there)
WORKDIR /app/backend

# Ensure bcrypt is rebuilt for this environment
RUN pnpm rebuild bcrypt

# Expose backend port
EXPOSE 3002

# Start the app using ts-node
CMD ["pnpm", "run", "start-ts"]
