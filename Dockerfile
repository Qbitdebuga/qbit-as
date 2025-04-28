# Base image with minimal dependencies
FROM node:20.18.1-alpine AS base
WORKDIR /app
# Use non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs
ENV NODE_ENV=production

# Development dependencies stage - with caching for faster builds
FROM base AS deps
COPY --chown=nestjs:nodejs package.json yarn.lock ./
# Store yarn cache in docker layer and benefit from layer caching
RUN --mount=type=cache,target=/home/nestjs/.yarn/cache \
    yarn install --frozen-lockfile

# Builder stage - build the application
FROM deps AS builder
COPY --chown=nestjs:nodejs . .
RUN yarn build

# Production dependencies stage - only install production dependencies
FROM base AS production-deps
COPY --chown=nestjs:nodejs package.json yarn.lock ./
# Use production flag to avoid installing dev dependencies
RUN --mount=type=cache,target=/home/nestjs/.yarn/cache \
    yarn install --production --frozen-lockfile

# Final stage - minimal image with only what's needed to run the app
FROM base AS runner
# Copy only necessary files from previous stages
COPY --chown=nestjs:nodejs --from=production-deps /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
COPY --chown=nestjs:nodejs --from=builder /app/package.json ./package.json

# Copy additional required files
COPY --chown=nestjs:nodejs prisma ./prisma
COPY --chown=nestjs:nodejs turbo.json ./turbo.json
COPY --chown=nestjs:nodejs .env.example ./.env

# Generate Prisma client
RUN yarn prisma generate

# Healthcheck to verify the service is running correctly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Expose default port
EXPOSE 3000

# Set up command
CMD ["yarn", "start"] 