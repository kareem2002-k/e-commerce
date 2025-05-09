FROM node:22-alpine

# Add native build tools for bcrypt
RUN apk add --no-cache python3 make g++ 

WORKDIR /app

COPY . .

ENV NODE_ENV=production

RUN npm install -g pnpm ts-node typescript

# Install root dependencies
RUN pnpm install

RUN pnpm install bcrypt

WORKDIR /app/backend

# Rebuild bcrypt from source inside container
RUN pnpm rebuild bcrypt && pnpm install

EXPOSE 3002

CMD ["pnpm", "run", "start-ts"]
