# Base image for all services
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Development dependencies stage
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Builder stage
FROM deps AS builder
COPY . .
RUN yarn build

# Production dependencies stage
FROM deps AS production-deps
RUN yarn install --production --frozen-lockfile

# Final stage
FROM base AS runner
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Additional files needed at runtime
COPY prisma ./prisma
COPY turbo.json ./turbo.json
COPY .env.example ./.env

# Generate Prisma client
RUN yarn prisma generate

# Set up command
CMD ["yarn", "start"] 