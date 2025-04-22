FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ./services/general-ledger/package*.json ./services/general-ledger/

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build -w general-ledger

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ./services/general-ledger/package*.json ./services/general-ledger/

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/services/general-ledger/dist ./services/general-ledger/dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose port
EXPOSE 3002

# Command to run the application
CMD ["node", "services/general-ledger/dist/main.js"] 