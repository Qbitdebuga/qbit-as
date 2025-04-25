# Base image
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Development dependencies
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Builder
FROM deps AS builder
COPY . .
RUN yarn build

# Production dependencies
FROM deps AS production-deps
RUN yarn install --production --frozen-lockfile

# Runner
FROM base AS runner
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Generate Prisma Client
COPY prisma ./prisma
RUN yarn prisma generate

# Set up health check and expose port
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3002/health || exit 1

# Start the application
CMD ["yarn", "start:prod"] 