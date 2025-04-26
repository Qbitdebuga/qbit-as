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
COPY --chown=nestjs:nodejs services/accounts-payable/package.json ./services/accounts-payable/
COPY --chown=nestjs:nodejs prisma ./prisma/
# Use build cache for faster builds
RUN --mount=type=cache,target=/home/nestjs/.yarn/cache \
    yarn install --frozen-lockfile

# Builder stage
FROM deps AS builder
# Copy source files
COPY --chown=nestjs:nodejs . .
# Build the application
RUN yarn build -w accounts-payable

# Production dependencies stage
FROM base AS production-deps
COPY --chown=nestjs:nodejs package.json yarn.lock ./
COPY --chown=nestjs:nodejs services/accounts-payable/package.json ./services/accounts-payable/
COPY --chown=nestjs:nodejs prisma ./prisma/
# Install only production dependencies and generate Prisma client
RUN --mount=type=cache,target=/home/nestjs/.yarn/cache \
    yarn install --production --frozen-lockfile && \
    yarn prisma generate

# Runner stage - minimal final image
FROM base AS runner
# Copy only necessary files from previous stages
COPY --chown=nestjs:nodejs --from=production-deps /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=production-deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nestjs:nodejs --from=builder /app/services/accounts-payable/dist ./services/accounts-payable/dist
COPY --chown=nestjs:nodejs --from=builder /app/package.json ./package.json

# Set up health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3003/health || exit 1

# Expose service port
EXPOSE 3003

# Start the application
CMD ["node", "services/accounts-payable/dist/main.js"] 