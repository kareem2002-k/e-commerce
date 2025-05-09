# Use Debian-based Node.js image
FROM node:22

# Install build tools needed for bcrypt and Prisma
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY . .

# Install global dev tools
RUN npm install -g pnpm ts-node typescript prisma

WORKDIR /app/backend

# Install backend dependencies
RUN pnpm install

# Rebuild native bcrypt binding
RUN pnpm rebuild bcrypt

# Generate Prisma Client for the correct platform
RUN pnpm exec prisma generate

# Optional: Deploy DB migrations in production
# RUN pnpm exec prisma migrate deploy

# Expose backend port
EXPOSE 3002

# Start the app
CMD ["pnpm", "run", "start-ts"]
