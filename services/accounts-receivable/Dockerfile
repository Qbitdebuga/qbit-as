FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY ./services/accounts-receivable/package.json ./services/accounts-receivable/

# Install dependencies
RUN yarn install

# Copy source files
COPY . .

# Build the application
RUN yarn build -w accounts-receivable

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY ./services/accounts-receivable/package.json ./services/accounts-receivable/

# Install production dependencies only
RUN yarn install --production

# Copy built files from builder stage
COPY --from=builder /app/services/accounts-receivable/dist ./services/accounts-receivable/dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN yarn prisma generate

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3004

# Expose port
EXPOSE 3004

# Command to run the application
CMD ["node", "services/accounts-receivable/dist/main.js"] 