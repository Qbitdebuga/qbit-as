FROM node:18-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN yarn prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install necessary utilities
RUN apt-get update && apt-get install -y postgresql-client netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy prisma schema
COPY prisma ./prisma/

# Copy scripts
COPY scripts ./scripts/
RUN chmod +x ./scripts/*.sh

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3004

# Start the application
CMD ["node", "dist/main"] 