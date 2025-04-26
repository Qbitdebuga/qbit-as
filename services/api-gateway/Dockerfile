# Base image with minimal dependencies
FROM node:20-alpine AS base
WORKDIR /app
# Use non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs
ENV NODE_ENV=production

# Development dependencies stage
FROM base AS deps
# Copy package files from monorepo
COPY --chown=nestjs:nodejs package.json yarn.lock ./
COPY --chown=nestjs:nodejs services/api-gateway/package.json ./services/api-gateway/
# Use build cache for faster builds
RUN --mount=type=cache,target=/home/nestjs/.yarn/cache \
    yarn install --frozen-lockfile

# Builder stage
FROM deps AS builder
# Copy source files
COPY --chown=nestjs:nodejs . .
# Build the application
RUN yarn build -w api-gateway

# Production dependencies stage
FROM base AS production-deps
COPY --chown=nestjs:nodejs package.json yarn.lock ./
COPY --chown=nestjs:nodejs services/api-gateway/package.json ./services/api-gateway/
# Install only production dependencies
RUN --mount=type=cache,target=/home/nestjs/.yarn/cache \
    yarn install --production --frozen-lockfile

# Runner stage - minimal final image
FROM base AS runner
# Copy only necessary files from previous stages
COPY --chown=nestjs:nodejs --from=production-deps /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --chown=nestjs:nodejs --from=builder /app/package.json ./package.json

# Set up health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Expose service port
EXPOSE 3000

# Start the application
CMD ["node", "services/api-gateway/dist/main.js"] 