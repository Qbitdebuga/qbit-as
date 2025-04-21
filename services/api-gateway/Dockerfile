# Base image
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Development dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM deps AS builder
COPY . .
RUN npm run build

# Production dependencies
FROM deps AS production-deps
RUN npm prune --production

# Runner
FROM base AS runner
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Set up health check and expose port
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"] 